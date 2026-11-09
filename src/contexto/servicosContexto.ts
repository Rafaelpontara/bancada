import { createContext } from 'react';
import type { ServicoCatalogo } from '../tipos';

export interface ServicosValor {
  servicosProprios: ServicoCatalogo[];
  adicionarServico: (servico: ServicoCatalogo) => void;
  excluirServico: (id: string) => void;
}

export const ServicosContexto = createContext<ServicosValor | null>(null);
