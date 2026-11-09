import { Link, useParams } from 'react-router-dom';
import { AcoesStatus } from '../componentes/AcoesStatus';
import { AlertasOS } from '../componentes/AlertasOS';
import { EstadoTela } from '../componentes/EstadoTela';
import { LinhaDoTempo } from '../componentes/LinhaDoTempo';
import { PainelOrcamento } from '../componentes/PainelOrcamento';
import { StatusBadge } from '../componentes/StatusBadge';
import { formatarData } from '../dominio/datas';
import { formatarReais } from '../dominio/dinheiro';
import { TAXA_DIAGNOSTICO_CENTAVOS, valorACobrar } from '../dominio/prazos';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';

function formatarTelefone(t: string) {
  return t.length === 11 ? `(${t.slice(0, 2)}) ${t.slice(2, 7)}-${t.slice(7)}` : `(${t.slice(0, 2)}) ${t.slice(2, 6)}-${t.slice(6)}`;
}

export function DetalheOrdemPage() {
  const { id = '' } = useParams();
  const { obterOrdem, hoje } = useOrdens();
  const os = obterOrdem(id);
  useTituloPagina(os ? `OS #${os.numero}` : 'OS não encontrada');

  if (!os) {
    return (
      <section className="secao">
        <EstadoTela tipo="vazio" titulo="Ordem de serviço não encontrada">
          Ela pode ter sido excluída. <Link to="/ordens">Voltar para a lista</Link>.
        </EstadoTela>
      </section>
    );
  }

  const cobrar = valorACobrar(os);

  return (
    <section className="secao" aria-labelledby="detalhe-titulo">
      <p className="migalha"><Link to="/ordens">← Ordens de serviço</Link></p>
      <div className="pagina__cabeca">
        <div>
          <p className="cartao-os__numero">OS #{String(os.numero).padStart(4, '0')}</p>
          <h1 id="detalhe-titulo" className="pagina__titulo">{os.marca} {os.modelo}</h1>
        </div>
        <div className="pagina__cabeca-acoes">
          <StatusBadge status={os.status} />
          <Link to={`/ordens/${os.id}/editar`} className="botao botao--pequeno">Editar</Link>
        </div>
      </div>
      <AlertasOS os={os} hoje={hoje} />

      <div className="detalhe">
        <div className="detalhe__principal">
          <section className="painel" aria-labelledby="andamento-titulo">
            <h2 id="andamento-titulo" className="painel__titulo">Andamento</h2>
            <AcoesStatus os={os} />
            {(os.status === 'recusado' || os.status === 'devolvido') && (
              <p className="texto-fraco">Orçamento recusado: cobrar taxa de diagnóstico de {formatarReais(TAXA_DIAGNOSTICO_CENTAVOS)}.</p>
            )}
          </section>
          <PainelOrcamento os={os} />
        </div>

        <aside className="detalhe__lateral">
          <section className="painel" aria-labelledby="dados-titulo">
            <h2 id="dados-titulo" className="painel__titulo">Dados</h2>
            <dl className="dados">
              <div><dt>Cliente</dt><dd>{os.cliente}</dd></div>
              <div><dt>Telefone</dt><dd><a href={`https://wa.me/55${os.telefone}`} target="_blank" rel="noreferrer">{formatarTelefone(os.telefone)}</a></dd></div>
              <div><dt>IMEI</dt><dd className="mono">{os.imei || 'Não informado'}</dd></div>
              <div><dt>Entrada</dt><dd>{formatarData(os.dataEntrada)}</dd></div>
              <div><dt>Defeito</dt><dd>{os.defeito}</dd></div>
              <div><dt>Valor a cobrar</dt><dd><strong>{formatarReais(cobrar)}</strong></dd></div>
            </dl>
          </section>
          <section className="painel" aria-labelledby="historico-titulo">
            <h2 id="historico-titulo" className="painel__titulo">Histórico</h2>
            <LinhaDoTempo historico={os.historico} />
          </section>
        </aside>
      </div>
    </section>
  );
}
