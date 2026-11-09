import type { DadosFormularioServico, ErrosServico, ServicoCatalogo } from '../tipos';
import { reaisParaCentavos } from './dinheiro';

export const PRAZO_MAXIMO_DIAS = 60;
export const GARANTIA_MAXIMA_DIAS = 365;

function inteiroEntre(texto: string, min: number, max: number): number | null {
  if (!/^\d+$/.test(texto.trim())) return null;
  const n = Number(texto);
  return n >= min && n <= max ? n : null;
}

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase();
}

export function validarServico(dados: DadosFormularioServico, existentes: ServicoCatalogo[]): ErrosServico {
  const erros: ErrosServico = {};

  if (dados.nome.trim().length < 3) {
    erros.nome = 'Informe o nome com pelo menos 3 letras';
  } else if (existentes.some((s) => normalizarNome(s.nome) === normalizarNome(dados.nome))) {
    erros.nome = 'Já existe um serviço com esse nome';
  }

  if (dados.categoria === '') erros.categoria = 'Escolha a categoria';

  const preco = reaisParaCentavos(dados.preco);
  if (preco === null || preco <= 0) erros.preco = 'Informe um preço maior que zero, como 120,00';

  if (inteiroEntre(dados.prazoDias, 0, PRAZO_MAXIMO_DIAS) === null) {
    erros.prazoDias = `Prazo em dias inteiros, de 0 a ${PRAZO_MAXIMO_DIAS}`;
  }
  if (inteiroEntre(dados.garantiaDias, 0, GARANTIA_MAXIMA_DIAS) === null) {
    erros.garantiaDias = `Garantia em dias inteiros, de 0 a ${GARANTIA_MAXIMA_DIAS}`;
  }

  return erros;
}

export function montarServico(dados: DadosFormularioServico, id: string): ServicoCatalogo {
  return {
    id,
    nome: dados.nome.trim(),
    categoria: dados.categoria === '' ? 'tela' : dados.categoria,
    precoCentavos: reaisParaCentavos(dados.preco) ?? 0,
    prazoDias: Number(dados.prazoDias),
    garantiaDias: Number(dados.garantiaDias),
    descricao: dados.descricao.trim(),
    proprio: true,
  };
}
