import type { ItemOrcamento, OrdemServico } from '../tipos';

export const HOJE = '2026-11-09';

export const TELA: ItemOrcamento = { servicoId: 'tela-ip11', nome: 'Troca de tela iPhone 11', precoCentavos: 35000, prazoDias: 2, garantiaDias: 90 };
export const PELICULA: ItemOrcamento = { servicoId: 'pelicula', nome: 'Película de vidro 3D', precoCentavos: 3000, prazoDias: 1, garantiaDias: 30 };
export const PLACA: ItemOrcamento = { servicoId: 'placa', nome: 'Reparo em placa', precoCentavos: 25000, prazoDias: 5, garantiaDias: 60 };

export function criarOS(parcial: Partial<OrdemServico> = {}): OrdemServico {
  return {
    id: 'os-1',
    numero: 1,
    cliente: 'Maria Souza',
    telefone: '99991234567',
    marca: 'Apple',
    modelo: 'iPhone 11',
    imei: '490154203237518',
    defeito: 'Tela quebrada após queda',
    dataEntrada: '2026-11-01',
    itens: [],
    descontoCentavos: 0,
    orcamentoEmitidoEm: null,
    aprovadoEm: null,
    entregueEm: null,
    status: 'recebido',
    historico: [{ status: 'recebido', data: '2026-11-01' }],
    ...parcial,
  };
}
