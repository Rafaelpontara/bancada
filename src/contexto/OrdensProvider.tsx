import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { gerarExemplos } from '../dados/exemplos';
import { hojeISO } from '../dominio/datas';
import { validarDesconto } from '../dominio/orcamento';
import * as regrasStatus from '../dominio/status';
import { somenteDigitos } from '../dominio/validacao';
import type { DadosFormularioOS, OrdemServico, Resultado, ServicoCatalogo, StatusOS } from '../tipos';
import { OrdensContexto } from './ordensContexto';
import type { OrdensValor } from './ordensContexto';

export const CHAVE_ARMAZENAMENTO = 'bancada:ordens';

function pareceOrdem(item: unknown): item is OrdemServico {
  const os = item as Partial<OrdemServico>;
  return (
    typeof os?.id === 'string' &&
    typeof os.numero === 'number' &&
    typeof os.cliente === 'string' &&
    typeof os.status === 'string' &&
    os.status in regrasStatus.ROTULO_STATUS &&
    Array.isArray(os.itens) &&
    Array.isArray(os.historico)
  );
}

// se o localStorage estiver vazio ou quebrado, comeca com lista vazia
function lerOrdensSalvas(): OrdemServico[] {
  try {
    const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(pareceOrdem) : [];
  } catch {
    return [];
  }
}

function novoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `os-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizar(dados: DadosFormularioOS): DadosFormularioOS {
  return {
    ...dados,
    cliente: dados.cliente.trim(),
    telefone: somenteDigitos(dados.telefone),
    marca: dados.marca.trim(),
    modelo: dados.modelo.trim(),
    imei: somenteDigitos(dados.imei),
    defeito: dados.defeito.trim(),
  };
}

export function OrdensProvider({ children }: { children: ReactNode }) {
  const [ordens, setOrdens] = useState<OrdemServico[]>(lerOrdensSalvas);
  const [hoje] = useState(() => hojeISO(new Date()));

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(ordens));
    } catch {
    }
  }, [ordens]);

  const substituir = useCallback((id: string, mudar: (os: OrdemServico) => OrdemServico) => {
    setOrdens((atuais) => atuais.map((os) => (os.id === id ? mudar(os) : os)));
  }, []);

  const obterOrdem = useCallback((id: string) => ordens.find((os) => os.id === id), [ordens]);

  const criarOrdem = useCallback(
    (dados: DadosFormularioOS) => {
      const limpos = normalizar(dados);
      const nova: OrdemServico = {
        ...limpos,
        id: novoId(),
        numero: regrasStatus.proximoNumero(ordens),
        itens: [],
        descontoCentavos: 0,
        orcamentoEmitidoEm: null,
        aprovadoEm: null,
        entregueEm: null,
        status: 'recebido',
        historico: [{ status: 'recebido', data: limpos.dataEntrada }],
      };
      setOrdens((atuais) => [...atuais, nova]);
      return nova;
    },
    [ordens],
  );

  const atualizarDados = useCallback(
    (id: string, dados: DadosFormularioOS) => substituir(id, (os) => ({ ...os, ...normalizar(dados) })),
    [substituir],
  );

  const excluirOrdem = useCallback((id: string) => {
    setOrdens((atuais) => atuais.filter((os) => os.id !== id));
  }, []);

  const aplicar = useCallback(
    (id: string, regra: (os: OrdemServico) => Resultado<OrdemServico>): Resultado<OrdemServico> => {
      const atual = ordens.find((os) => os.id === id);
      if (!atual) return { ok: false, erro: 'Ordem de serviço não encontrada' };
      const resultado = regra(atual);
      if (resultado.ok) substituir(id, () => resultado.valor);
      return resultado;
    },
    [ordens, substituir],
  );

  const mudarStatus = useCallback(
    (id: string, destino: StatusOS) => aplicar(id, (os) => regrasStatus.mudarStatus(os, destino, hoje)),
    [aplicar, hoje],
  );

  const reemitirOrcamento = useCallback(
    (id: string) => aplicar(id, (os) => regrasStatus.reemitirOrcamento(os, hoje)),
    [aplicar, hoje],
  );

  const adicionarServico = useCallback(
    (id: string, servico: ServicoCatalogo) =>
      substituir(id, (os) => ({
        ...os,
        descontoCentavos: 0,
        itens: [
          ...os.itens,
          {
            servicoId: servico.id,
            nome: servico.nome,
            precoCentavos: servico.precoCentavos,
            prazoDias: servico.prazoDias,
            garantiaDias: servico.garantiaDias,
          },
        ],
      })),
    [substituir],
  );

  const removerServico = useCallback(
    (id: string, indice: number) =>
      substituir(id, (os) => ({ ...os, descontoCentavos: 0, itens: os.itens.filter((_, i) => i !== indice) })),
    [substituir],
  );

  const definirDesconto = useCallback(
    (id: string, centavos: number): Resultado<number> => {
      const atual = ordens.find((os) => os.id === id);
      if (!atual) return { ok: false, erro: 'Ordem de serviço não encontrada' };
      const resultado = validarDesconto(atual.itens, centavos);
      if (resultado.ok) substituir(id, (os) => ({ ...os, descontoCentavos: centavos }));
      return resultado;
    },
    [ordens, substituir],
  );

  const carregarExemplos = useCallback(() => setOrdens(gerarExemplos(hoje)), [hoje]);

  const valor = useMemo<OrdensValor>(
    () => ({
      ordens,
      hoje,
      obterOrdem,
      criarOrdem,
      atualizarDados,
      excluirOrdem,
      mudarStatus,
      reemitirOrcamento,
      adicionarServico,
      removerServico,
      definirDesconto,
      carregarExemplos,
    }),
    [ordens, hoje, obterOrdem, criarOrdem, atualizarDados, excluirOrdem, mudarStatus, reemitirOrcamento, adicionarServico, removerServico, definirDesconto, carregarExemplos],
  );

  return <OrdensContexto.Provider value={valor}>{children}</OrdensContexto.Provider>;
}
