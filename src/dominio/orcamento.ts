import type { ItemOrcamento, Resultado } from '../tipos';
import { formatarReais } from './dinheiro';

export const DESCONTO_MAXIMO_PERCENTUAL = 10;

export function calcularSubtotal(itens: ItemOrcamento[]): number {
  return itens.reduce((soma, item) => soma + item.precoCentavos, 0);
}

export function descontoMaximo(subtotalCentavos: number): number {
  return Math.round((subtotalCentavos * DESCONTO_MAXIMO_PERCENTUAL) / 100);
}

export function validarDesconto(itens: ItemOrcamento[], descontoCentavos: number): Resultado<number> {
  if (!Number.isInteger(descontoCentavos) || descontoCentavos < 0) {
    return { ok: false, erro: 'Desconto inválido' };
  }
  const limite = descontoMaximo(calcularSubtotal(itens));
  if (descontoCentavos > limite) {
    return {
      ok: false,
      erro: `Desconto máximo de ${DESCONTO_MAXIMO_PERCENTUAL}% (${formatarReais(limite)})`,
    };
  }
  return { ok: true, valor: descontoCentavos };
}

export interface ResumoOrcamento {
  subtotal: number;
  desconto: number;
  total: number;
  prazoDias: number;
  garantiaDias: number;
}

export function calcularOrcamento(itens: ItemOrcamento[], descontoCentavos: number): ResumoOrcamento {
  const subtotal = calcularSubtotal(itens);
  return {
    subtotal,
    desconto: descontoCentavos,
    total: subtotal - descontoCentavos,
    prazoDias: Math.max(0, ...itens.map((i) => i.prazoDias)),
    garantiaDias: Math.max(0, ...itens.map((i) => i.garantiaDias)),
  };
}
