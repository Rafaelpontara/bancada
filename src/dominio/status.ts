import type { DataISO, OrdemServico, Resultado, StatusOS } from '../tipos';
import { formatarData } from './datas';
import { situacaoOrcamento } from './prazos';

export const ROTULO_STATUS: Record<StatusOS, string> = {
  recebido: 'Recebido',
  diagnostico: 'Em diagnóstico',
  aguardando: 'Aguardando aprovação',
  reparo: 'Em reparo',
  pronto: 'Pronto para retirada',
  entregue: 'Entregue',
  recusado: 'Orçamento recusado',
  devolvido: 'Devolvido sem reparo',
};

export const TRANSICOES: Record<StatusOS, StatusOS[]> = {
  recebido: ['diagnostico'],
  diagnostico: ['aguardando'],
  aguardando: ['reparo', 'recusado'],
  reparo: ['pronto'],
  pronto: ['entregue'],
  recusado: ['devolvido'],
  entregue: [],
  devolvido: [],
};

export const STATUS_FINAIS: StatusOS[] = ['entregue', 'devolvido'];

export function estaAberta(status: StatusOS): boolean {
  return !STATUS_FINAIS.includes(status);
}

export function podeEditarOrcamento(status: StatusOS): boolean {
  return status === 'diagnostico';
}

export function mudarStatus(os: OrdemServico, destino: StatusOS, hoje: DataISO): Resultado<OrdemServico> {
  if (!TRANSICOES[os.status].includes(destino)) {
    return {
      ok: false,
      erro: `Transição inválida: ${ROTULO_STATUS[os.status]} → ${ROTULO_STATUS[destino]}`,
    };
  }

  const nova: OrdemServico = {
    ...os,
    status: destino,
    historico: [...os.historico, { status: destino, data: hoje }],
  };

  if (destino === 'aguardando') {
    if (os.itens.length === 0) {
      return { ok: false, erro: 'Adicione pelo menos um serviço ao orçamento' };
    }
    nova.orcamentoEmitidoEm = hoje;
  }

  if (destino === 'reparo') {
    const orcamento = situacaoOrcamento(os, hoje);
    if (orcamento.tipo === 'vencido') {
      return {
        ok: false,
        erro: `Orçamento vencido em ${formatarData(orcamento.validoAte)}. Emita um novo orçamento.`,
      };
    }
    nova.aprovadoEm = hoje;
  }

  if (destino === 'entregue') {
    nova.entregueEm = hoje;
  }

  return { ok: true, valor: nova };
}

export function reemitirOrcamento(os: OrdemServico, hoje: DataISO): Resultado<OrdemServico> {
  if (os.status !== 'aguardando') {
    return { ok: false, erro: 'Só é possível reemitir um orçamento aguardando aprovação' };
  }
  return { ok: true, valor: { ...os, orcamentoEmitidoEm: hoje } };
}

export function proximoNumero(ordens: Pick<OrdemServico, 'numero'>[]): number {
  return ordens.reduce((maior, os) => Math.max(maior, os.numero), 0) + 1;
}
