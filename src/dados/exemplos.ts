import { somarDias } from '../dominio/datas';
import type { DataISO, EventoStatus, ItemOrcamento, OrdemServico, StatusOS } from '../tipos';

const ITENS: Record<string, ItemOrcamento> = {
  telaIp11: { servicoId: 'tela-ip11', nome: 'Troca de tela iPhone 11', precoCentavos: 35000, prazoDias: 2, garantiaDias: 90 },
  pelicula: { servicoId: 'pelicula', nome: 'Película de vidro 3D', precoCentavos: 3000, prazoDias: 0, garantiaDias: 30 },
  conector: { servicoId: 'conector', nome: 'Troca de conector de carga', precoCentavos: 12000, prazoDias: 1, garantiaDias: 90 },
  placa: { servicoId: 'placa', nome: 'Reparo em placa (microssolda)', precoCentavos: 25000, prazoDias: 5, garantiaDias: 60 },
  oxidacao: { servicoId: 'oxidacao', nome: 'Tratamento de oxidação (banho químico)', precoCentavos: 15000, prazoDias: 3, garantiaDias: 30 },
  telaRedmi: { servicoId: 'tela-redmi13', nome: 'Troca de tela Redmi Note 13', precoCentavos: 31000, prazoDias: 2, garantiaDias: 90 },
  bateriaIp: { servicoId: 'bateria-ip', nome: 'Troca de bateria iPhone', precoCentavos: 22000, prazoDias: 1, garantiaDias: 90 },
  telaG54: { servicoId: 'tela-g54', nome: 'Troca de tela Moto G54', precoCentavos: 29000, prazoDias: 2, garantiaDias: 90 },
  bateriaAndroid: { servicoId: 'bateria-android', nome: 'Troca de bateria Android', precoCentavos: 16000, prazoDias: 1, garantiaDias: 90 },
};

interface Base {
  numero: number;
  cliente: string;
  telefone: string;
  marca: string;
  modelo: string;
  imei: string;
  defeito: string;
  itens: ItemOrcamento[];
  desconto?: number;
  passos: [StatusOS, number][];
}

function montar(base: Base, hoje: DataISO): OrdemServico {
  const historico: EventoStatus[] = base.passos.map(([status, dias]) => ({ status, data: somarDias(hoje, dias) }));
  const dataDe = (s: StatusOS) => historico.find((e) => e.status === s)?.data ?? null;
  return {
    id: `exemplo-${base.numero}`,
    numero: base.numero,
    cliente: base.cliente,
    telefone: base.telefone,
    marca: base.marca,
    modelo: base.modelo,
    imei: base.imei,
    defeito: base.defeito,
    dataEntrada: historico[0].data,
    itens: base.itens,
    descontoCentavos: base.desconto ?? 0,
    orcamentoEmitidoEm: dataDe('aguardando'),
    aprovadoEm: dataDe('reparo'),
    entregueEm: dataDe('entregue'),
    status: historico[historico.length - 1].status,
    historico,
  };
}

export function gerarExemplos(hoje: DataISO): OrdemServico[] {
  const bases: Base[] = [
    { numero: 1, cliente: 'Sandra Dias', telefone: '99981112233', marca: 'Samsung', modelo: 'Galaxy A54', imei: '357114710497460',
      defeito: 'Bateria descarregando muito rápido', itens: [ITENS.bateriaAndroid],
      passos: [['recebido', -120], ['diagnostico', -120], ['aguardando', -119], ['reparo', -119], ['pronto', -118], ['entregue', -115]] },
    { numero: 2, cliente: 'Luana Costa', telefone: '99984445566', marca: 'Motorola', modelo: 'Moto G54', imei: '357601895559791',
      defeito: 'Tela trincada no canto inferior', itens: [ITENS.telaG54],
      passos: [['recebido', -15], ['diagnostico', -15], ['aguardando', -14], ['recusado', -13], ['devolvido', -12]] },
    { numero: 3, cliente: 'Maria Souza', telefone: '99991234567', marca: 'Apple', modelo: 'iPhone 11', imei: '355260181590838',
      defeito: 'Tela quebrada após queda, touch falhando', itens: [ITENS.telaIp11, ITENS.pelicula], desconto: 2000,
      passos: [['recebido', -12], ['diagnostico', -12], ['aguardando', -11], ['reparo', -10], ['pronto', -8], ['entregue', -7]] },
    { numero: 4, cliente: 'Ana Lima', telefone: '99987654321', marca: 'Motorola', modelo: 'Moto G54', imei: '350166131860913',
      defeito: 'Caiu na água e não liga mais', itens: [ITENS.oxidacao],
      passos: [['recebido', -10], ['diagnostico', -10], ['aguardando', -9]] },
    { numero: 5, cliente: 'João Pereira', telefone: '99982223344', marca: 'Samsung', modelo: 'Galaxy A54', imei: '353909960308240',
      defeito: 'Não carrega, esquenta perto do conector', itens: [ITENS.placa, ITENS.conector],
      passos: [['recebido', -8], ['diagnostico', -8], ['aguardando', -7], ['reparo', -6]] },
    { numero: 6, cliente: 'Fernanda Rocha', telefone: '99985556677', marca: 'Apple', modelo: 'iPhone 13', imei: '356281948219932',
      defeito: 'Bateria com saúde em 71%, desliga sozinho', itens: [ITENS.bateriaIp],
      passos: [['recebido', -3], ['diagnostico', -3], ['aguardando', -3], ['reparo', -2], ['pronto', -1]] },
    { numero: 7, cliente: 'Carlos Mendes', telefone: '99986667788', marca: 'Xiaomi', modelo: 'Redmi Note 13', imei: '355181909378654',
      defeito: 'Tela com manchas e linhas verdes', itens: [ITENS.telaRedmi],
      passos: [['recebido', -2], ['diagnostico', -2], ['aguardando', -1]] },
    { numero: 8, cliente: 'Pedro Alves', telefone: '99988889900', marca: 'Samsung', modelo: 'Galaxy S21', imei: '357975432319483',
      defeito: 'Sistema travando na logo da Samsung', itens: [],
      passos: [['recebido', -1], ['diagnostico', 0]] },
    { numero: 9, cliente: 'Bruno Martins', telefone: '9935421100', marca: 'Apple', modelo: 'iPhone 11', imei: '357574911862525',
      defeito: 'Alto-falante baixo nas ligações', itens: [],
      passos: [['recebido', 0]] },
  ];
  return bases.map((b) => montar(b, hoje));
}
