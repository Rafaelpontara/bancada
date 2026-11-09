import type { DataISO, OrdemServico, StatusOS } from '../tipos';
import { formatarData } from './datas';
import { formatarReais } from './dinheiro';
import { calcularOrcamento } from './orcamento';
import { situacaoPrazo, valorACobrar } from './prazos';
import { ROTULO_STATUS } from './status';

export interface Relatorio {
  totalOrdens: number;
  porStatus: Record<StatusOS, number>;
  faturamento: number;
  ticketMedio: number;
  taxaAprovacao: number;
  atrasadas: number;
  servicosMaisFeitos: { nome: string; quantidade: number }[];
}

export function gerarRelatorio(ordens: OrdemServico[], hoje: DataISO): Relatorio {
  const porStatus = Object.fromEntries(
    (Object.keys(ROTULO_STATUS) as StatusOS[]).map((s) => [s, 0]),
  ) as Record<StatusOS, number>;
  ordens.forEach((os) => porStatus[os.status]++);

  const entregues = ordens.filter((os) => os.status === 'entregue');
  const devolvidas = ordens.filter((os) => os.status === 'devolvido');
  const faturamento = [...entregues, ...devolvidas].reduce((soma, os) => soma + valorACobrar(os), 0);
  const somaEntregues = entregues.reduce((soma, os) => soma + valorACobrar(os), 0);
  const ticketMedio = entregues.length ? Math.round(somaEntregues / entregues.length) : 0;

  const aprovadas = ordens.filter((os) => os.aprovadoEm).length;
  const recusadas = ordens.filter((os) => os.status === 'recusado' || os.status === 'devolvido').length;
  const respondidas = aprovadas + recusadas;
  const taxaAprovacao = respondidas ? Math.round((aprovadas / respondidas) * 100) : 0;

  const atrasadas = ordens.filter((os) => situacaoPrazo(os, hoje).tipo === 'atrasada').length;

  const contagem = new Map<string, number>();
  ordens
    .filter((os) => os.aprovadoEm)
    .flatMap((os) => os.itens)
    .forEach((item) => contagem.set(item.nome, (contagem.get(item.nome) ?? 0) + 1));
  const servicosMaisFeitos = [...contagem.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome))
    .slice(0, 5);

  return {
    totalOrdens: ordens.length,
    porStatus,
    faturamento,
    ticketMedio,
    taxaAprovacao,
    atrasadas,
    servicosMaisFeitos,
  };
}

function celulaCsv(valor: string | number): string {
  const texto = String(valor);
  return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCsv(ordens: OrdemServico[]): string {
  const cabecalho = ['OS', 'Entrada', 'Cliente', 'Aparelho', 'Status', 'Total'];
  const linhas = [...ordens]
    .sort((a, b) => a.numero - b.numero)
    .map((os) => [
      os.numero,
      formatarData(os.dataEntrada),
      os.cliente,
      `${os.marca} ${os.modelo}`,
      ROTULO_STATUS[os.status],
      formatarReais(os.aprovadoEm ? calcularOrcamento(os.itens, os.descontoCentavos).total : valorACobrar(os)),
    ]);
  return [cabecalho, ...linhas].map((linha) => linha.map(celulaCsv).join(';')).join('\n');
}
