import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CampoBusca } from '../componentes/CampoBusca';
import { CartaoOS } from '../componentes/CartaoOS';
import { EstadoTela } from '../componentes/EstadoTela';
import { ROTULO_STATUS } from '../dominio/status';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';
import type { StatusOS } from '../tipos';

type Ordenacao = 'recentes' | 'antigas' | 'cliente';

function normalizarTexto(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function OrdensPage() {
  useTituloPagina('Ordens de serviço');
  const { ordens, hoje } = useOrdens();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as StatusOS | '';
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recentes');

  const filtradas = useMemo(() => {
    const termo = normalizarTexto(busca.trim());
    return ordens
      .filter((os) => !status || os.status === status)
      .filter((os) => {
        if (!termo) return true;
        const alvo = normalizarTexto(`${os.numero} ${os.cliente} ${os.marca} ${os.modelo} ${os.imei}`);
        return alvo.includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === 'cliente') return a.cliente.localeCompare(b.cliente);
        return ordenacao === 'recentes' ? b.numero - a.numero : a.numero - b.numero;
      });
  }, [ordens, status, busca, ordenacao]);

  return (
    <section className="secao" aria-labelledby="ordens-titulo">
      <div className="pagina__cabeca">
        <h1 id="ordens-titulo" className="pagina__titulo">Ordens de serviço</h1>
        <Link to="/ordens/nova" className="botao botao--primario">+ Nova OS</Link>
      </div>

      <div className="filtros">
        <CampoBusca id="busca-os" rotulo="Buscar" valor={busca} onChange={setBusca} placeholder="Cliente, aparelho, nº da OS ou IMEI" />
        <div>
          <label htmlFor="filtro-status" className="campo__rotulo">Status</label>
          <select
            id="filtro-status"
            className="entrada"
            value={status}
            onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}
          >
            <option value="">Todos</option>
            {(Object.keys(ROTULO_STATUS) as StatusOS[]).map((s) => (
              <option key={s} value={s}>{ROTULO_STATUS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ordenar" className="campo__rotulo">Ordenar por</label>
          <select id="ordenar" className="entrada" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}>
            <option value="recentes">Mais recentes</option>
            <option value="antigas">Mais antigas</option>
            <option value="cliente">Cliente (A-Z)</option>
          </select>
        </div>
      </div>

      <p className="texto-fraco" aria-live="polite">
        {filtradas.length === 1 ? '1 ordem encontrada' : `${filtradas.length} ordens encontradas`}
      </p>

      {ordens.length === 0 ? (
        <EstadoTela tipo="vazio" titulo="Nenhuma OS cadastrada">
          <Link to="/ordens/nova">Cadastre a primeira ordem de serviço</Link>.
        </EstadoTela>
      ) : filtradas.length === 0 ? (
        <EstadoTela tipo="vazio" titulo="Nenhuma OS com esses filtros">Tente outro termo de busca ou outro status.</EstadoTela>
      ) : (
        <ul className="grade" aria-label="Ordens de serviço">
          {filtradas.map((os) => (
            <li key={os.id}><CartaoOS os={os} hoje={hoje} /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
