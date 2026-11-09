import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CATEGORIAS } from '../dominio/categorias';
import type { ServicoCatalogo } from '../tipos';
import { ServicosContexto } from './servicosContexto';
import type { ServicosValor } from './servicosContexto';

export const CHAVE_SERVICOS = 'bancada:servicos';

function pareceServico(item: unknown): item is ServicoCatalogo {
  const s = item as Partial<ServicoCatalogo>;
  return (
    typeof s?.id === 'string' &&
    typeof s.nome === 'string' &&
    CATEGORIAS.includes(s.categoria as ServicoCatalogo['categoria']) &&
    Number.isInteger(s.precoCentavos) &&
    Number.isInteger(s.prazoDias) &&
    Number.isInteger(s.garantiaDias)
  );
}

function lerServicosSalvos(): ServicoCatalogo[] {
  try {
    const bruto = localStorage.getItem(CHAVE_SERVICOS);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(pareceServico) : [];
  } catch {
    return [];
  }
}

export function ServicosProvider({ children }: { children: ReactNode }) {
  const [servicosProprios, setServicosProprios] = useState<ServicoCatalogo[]>(lerServicosSalvos);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_SERVICOS, JSON.stringify(servicosProprios));
    } catch {
      // sem espaço: vale só nesta sessão
    }
  }, [servicosProprios]);

  const adicionarServico = useCallback((servico: ServicoCatalogo) => {
    setServicosProprios((atuais) => [...atuais, servico]);
  }, []);

  const excluirServico = useCallback((id: string) => {
    setServicosProprios((atuais) => atuais.filter((s) => s.id !== id));
  }, []);

  const valor = useMemo<ServicosValor>(
    () => ({ servicosProprios, adicionarServico, excluirServico }),
    [servicosProprios, adicionarServico, excluirServico],
  );

  return <ServicosContexto.Provider value={valor}>{children}</ServicosContexto.Provider>;
}
