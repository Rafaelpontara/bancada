import type { DataISO, OrdemServico } from '../tipos';
import { diasEntre, somarDias } from './datas';
import { calcularOrcamento } from './orcamento';

export const VALIDADE_ORCAMENTO_DIAS = 7;
export const TAXA_DIAGNOSTICO_CENTAVOS = 3000;

export type SituacaoOrcamento =
  | { tipo: 'sem-orcamento' }
  | { tipo: 'valido'; validoAte: DataISO; diasRestantes: number }
  | { tipo: 'vencido'; validoAte: DataISO };

export function situacaoOrcamento(
  os: Pick<OrdemServico, 'orcamentoEmitidoEm'>,
  hoje: DataISO,
): SituacaoOrcamento {
  if (!os.orcamentoEmitidoEm) return { tipo: 'sem-orcamento' };
  const validoAte = somarDias(os.orcamentoEmitidoEm, VALIDADE_ORCAMENTO_DIAS);
  const diasRestantes = diasEntre(hoje, validoAte);
  return diasRestantes < 0 ? { tipo: 'vencido', validoAte } : { tipo: 'valido', validoAte, diasRestantes };
}

export type SituacaoPrazo =
  | { tipo: 'sem-prazo' }
  | { tipo: 'concluida' }
  | { tipo: 'no-prazo'; previsao: DataISO; diasRestantes: number }
  | { tipo: 'atrasada'; previsao: DataISO; diasAtraso: number };

export function situacaoPrazo(
  os: Pick<OrdemServico, 'aprovadoEm' | 'itens' | 'status' | 'descontoCentavos'>,
  hoje: DataISO,
): SituacaoPrazo {
  if (!os.aprovadoEm) return { tipo: 'sem-prazo' };
  if (os.status === 'pronto' || os.status === 'entregue') return { tipo: 'concluida' };
  const { prazoDias } = calcularOrcamento(os.itens, os.descontoCentavos);
  const previsao = somarDias(os.aprovadoEm, prazoDias);
  const restante = diasEntre(hoje, previsao);
  return restante < 0
    ? { tipo: 'atrasada', previsao, diasAtraso: -restante }
    : { tipo: 'no-prazo', previsao, diasRestantes: restante };
}

export type SituacaoGarantia =
  | { tipo: 'sem-garantia' }
  | { tipo: 'ativa'; validaAte: DataISO; diasRestantes: number }
  | { tipo: 'expirada'; validaAte: DataISO };

export function situacaoGarantia(
  os: Pick<OrdemServico, 'entregueEm' | 'itens' | 'descontoCentavos'>,
  hoje: DataISO,
): SituacaoGarantia {
  if (!os.entregueEm) return { tipo: 'sem-garantia' };
  const { garantiaDias } = calcularOrcamento(os.itens, os.descontoCentavos);
  if (garantiaDias === 0) return { tipo: 'sem-garantia' };
  const validaAte = somarDias(os.entregueEm, garantiaDias);
  const diasRestantes = diasEntre(hoje, validaAte);
  return diasRestantes < 0 ? { tipo: 'expirada', validaAte } : { tipo: 'ativa', validaAte, diasRestantes };
}

export function valorACobrar(
  os: Pick<OrdemServico, 'aprovadoEm' | 'status' | 'itens' | 'descontoCentavos'>,
): number {
  if (os.aprovadoEm) return calcularOrcamento(os.itens, os.descontoCentavos).total;
  if (os.status === 'recusado' || os.status === 'devolvido') return TAXA_DIAGNOSTICO_CENTAVOS;
  return 0;
}
