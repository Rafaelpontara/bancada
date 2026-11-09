export type DataISO = string;

export type CategoriaServico = 'tela' | 'bateria' | 'conector' | 'camera' | 'software' | 'placa';

export interface ServicoCatalogo {
  id: string;
  nome: string;
  categoria: CategoriaServico;
  precoCentavos: number;
  prazoDias: number;
  garantiaDias: number;
  descricao: string;
  proprio?: boolean;
}

export interface DadosFormularioServico {
  nome: string;
  categoria: CategoriaServico | '';
  preco: string;
  prazoDias: string;
  garantiaDias: string;
  descricao: string;
}

export type ErrosServico = Partial<Record<keyof DadosFormularioServico, string>>;

export interface ItemOrcamento {
  servicoId: string;
  nome: string;
  precoCentavos: number;
  prazoDias: number;
  garantiaDias: number;
}

export type StatusOS =
  | 'recebido'
  | 'diagnostico'
  | 'aguardando'
  | 'reparo'
  | 'pronto'
  | 'entregue'
  | 'recusado'
  | 'devolvido';

export interface EventoStatus {
  status: StatusOS;
  data: DataISO;
}

export interface OrdemServico {
  id: string;
  numero: number;
  cliente: string;
  telefone: string;
  marca: string;
  modelo: string;
  imei: string;
  defeito: string;
  dataEntrada: DataISO;
  itens: ItemOrcamento[];
  descontoCentavos: number;
  orcamentoEmitidoEm: DataISO | null;
  aprovadoEm: DataISO | null;
  entregueEm: DataISO | null;
  status: StatusOS;
  historico: EventoStatus[];
}

export interface DadosFormularioOS {
  cliente: string;
  telefone: string;
  marca: string;
  modelo: string;
  imei: string;
  defeito: string;
  dataEntrada: DataISO;
}

export type ErrosFormulario = Partial<Record<keyof DadosFormularioOS, string>>;

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };
