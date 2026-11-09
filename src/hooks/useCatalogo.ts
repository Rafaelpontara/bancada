import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErroCatalogo, buscarServicos } from '../servicos/catalogo';
import type { ServicoCatalogo } from '../tipos';
import { useServicosProprios } from './useServicosProprios';

export type EstadoCatalogo =
  | { fase: 'carregando' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronto'; servicos: ServicoCatalogo[] };

export function useCatalogo() {
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<EstadoCatalogo>({ fase: 'carregando' });
  const { servicosProprios } = useServicosProprios();

  useEffect(() => {
    const controle = new AbortController();
    buscarServicos(controle.signal)
      .then((servicos) => setEstado({ fase: 'pronto', servicos }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return;
        const mensagem = erro instanceof ErroCatalogo ? erro.message : 'Não foi possível carregar o catálogo.';
        setEstado({ fase: 'erro', mensagem });
      });
    return () => controle.abort();
  }, [tentativa]);

  const tentarDeNovo = useCallback(() => {
    setEstado({ fase: 'carregando' });
    setTentativa((t) => t + 1);
  }, []);
  // junta o catálogo do JSON com os serviços cadastrados na loja
  const estadoComProprios = useMemo<EstadoCatalogo>(
    () => (estado.fase === 'pronto' ? { fase: 'pronto', servicos: [...estado.servicos, ...servicosProprios] } : estado),
    [estado, servicosProprios],
  );

  return { estado: estadoComProprios, tentarDeNovo };
}
