import type { CategoriaServico, ServicoCatalogo } from '../tipos';

export class ErroCatalogo extends Error {}

const CATEGORIAS: CategoriaServico[] = ['tela', 'bateria', 'conector', 'camera', 'software', 'placa'];

// arquivo local carrega rapido demais, o atraso e so pra ver o "carregando"
const ESPERA_MS = 600;

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ehServico(item: unknown): item is ServicoCatalogo {
  const s = item as Partial<ServicoCatalogo>;
  return (
    typeof s?.id === 'string' &&
    typeof s.nome === 'string' &&
    CATEGORIAS.includes(s.categoria as CategoriaServico) &&
    Number.isInteger(s.precoCentavos) &&
    Number.isInteger(s.prazoDias) &&
    Number.isInteger(s.garantiaDias)
  );
}

export async function buscarServicos(signal?: AbortSignal): Promise<ServicoCatalogo[]> {
  await esperar(ESPERA_MS);
  let resposta: Response;
  try {
    resposta = await fetch(`${import.meta.env.BASE_URL}dados/servicos.json`, { signal });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro;
    throw new ErroCatalogo('Sem conexão. Confira a internet e tente de novo.');
  }
  if (!resposta.ok) {
    throw new ErroCatalogo(`O catálogo não respondeu (erro ${resposta.status}).`);
  }
  const dados: unknown = await resposta.json().catch(() => null);
  if (!Array.isArray(dados)) {
    throw new ErroCatalogo('O catálogo veio em um formato inesperado.');
  }
  return dados.filter(ehServico);
}
