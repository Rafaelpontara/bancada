import type { CategoriaServico } from '../tipos';

export const ROTULO_CATEGORIA: Record<CategoriaServico, string> = {
  tela: 'Tela',
  bateria: 'Bateria',
  conector: 'Conector',
  camera: 'Câmera',
  software: 'Software',
  placa: 'Placa',
};

export const CATEGORIAS = Object.keys(ROTULO_CATEGORIA) as CategoriaServico[];
