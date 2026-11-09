import { createContext } from 'react';
import type { DadosFormularioOS, DataISO, OrdemServico, Resultado, ServicoCatalogo, StatusOS } from '../tipos';

export interface OrdensValor {
  ordens: OrdemServico[];
  hoje: DataISO;
  obterOrdem: (id: string) => OrdemServico | undefined;
  criarOrdem: (dados: DadosFormularioOS) => OrdemServico;
  atualizarDados: (id: string, dados: DadosFormularioOS) => void;
  excluirOrdem: (id: string) => void;
  mudarStatus: (id: string, destino: StatusOS) => Resultado<OrdemServico>;
  reemitirOrcamento: (id: string) => Resultado<OrdemServico>;
  adicionarServico: (id: string, servico: ServicoCatalogo) => void;
  removerServico: (id: string, indice: number) => void;
  definirDesconto: (id: string, centavos: number) => Resultado<number>;
  carregarExemplos: () => void;
}

export const OrdensContexto = createContext<OrdensValor | null>(null);
