import { Link } from 'react-router-dom';
import { CartaoIndicador } from '../componentes/CartaoIndicador';
import { EstadoTela } from '../componentes/EstadoTela';
import { GraficoBarras } from '../componentes/GraficoBarras';
import { formatarReais } from '../dominio/dinheiro';
import { gerarCsv, gerarRelatorio } from '../dominio/relatorio';
import { ROTULO_STATUS } from '../dominio/status';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';
import type { StatusOS } from '../tipos';

function baixarCsv(conteudo: string, nome: string) {
  // BOM no inicio pro Excel abrir com acento
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function RelatorioPage() {
  useTituloPagina('Relatório');
  const { ordens, hoje } = useOrdens();

  if (ordens.length === 0) {
    return (
      <section className="secao">
        <h1 className="pagina__titulo">Relatório</h1>
        <EstadoTela tipo="vazio" titulo="Sem dados para o relatório">
          <Link to="/ordens/nova">Cadastre uma OS</Link> ou carregue os exemplos no painel.
        </EstadoTela>
      </section>
    );
  }

  const r = gerarRelatorio(ordens, hoje);
  const barrasStatus = (Object.keys(ROTULO_STATUS) as StatusOS[]).map((s) => ({ rotulo: ROTULO_STATUS[s], valor: r.porStatus[s] }));

  return (
    <section className="secao" aria-labelledby="relatorio-titulo">
      <div className="pagina__cabeca">
        <h1 id="relatorio-titulo" className="pagina__titulo">Relatório</h1>
        <button type="button" className="botao" onClick={() => baixarCsv(gerarCsv(ordens), `bancada-ordens-${hoje}.csv`)}>
          Exportar CSV
        </button>
      </div>

      <div className="indicadores">
        <CartaoIndicador titulo="Faturamento" valor={formatarReais(r.faturamento)} detalhe="OS entregues + taxas de diagnóstico" tom="sucesso" />
        <CartaoIndicador titulo="Ticket médio" valor={formatarReais(r.ticketMedio)} detalhe="por OS entregue" />
        <CartaoIndicador titulo="Aprovação" valor={`${r.taxaAprovacao}%`} detalhe="dos orçamentos respondidos" />
        <CartaoIndicador titulo="Atrasadas" valor={r.atrasadas} tom={r.atrasadas ? 'perigo' : 'normal'} detalhe={`de ${r.totalOrdens} OS no total`} />
      </div>

      <div className="relatorio__graficos">
        <div className="painel">
          <GraficoBarras titulo="Ordens por status" barras={barrasStatus} />
        </div>
        <div className="painel">
          {r.servicosMaisFeitos.length ? (
            <GraficoBarras titulo="Serviços mais aprovados" barras={r.servicosMaisFeitos.map((s) => ({ rotulo: s.nome.length > 22 ? s.nome.slice(0, 21) + '…' : s.nome, valor: s.quantidade }))} />
          ) : (
            <EstadoTela tipo="vazio" titulo="Nenhum orçamento aprovado ainda" />
          )}
        </div>
      </div>
    </section>
  );
}
