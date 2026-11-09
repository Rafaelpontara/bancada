import { Link } from 'react-router-dom';
import { CartaoIndicador } from '../componentes/CartaoIndicador';
import { CartaoOS } from '../componentes/CartaoOS';
import { EstadoTela } from '../componentes/EstadoTela';
import { situacaoOrcamento, situacaoPrazo } from '../dominio/prazos';
import { estaAberta } from '../dominio/status';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';

export function PainelPage() {
  useTituloPagina('Painel');
  const { ordens, hoje, carregarExemplos } = useOrdens();

  if (ordens.length === 0) {
    return (
      <section className="secao" aria-labelledby="painel-titulo">
        <h1 id="painel-titulo" className="pagina__titulo">Painel da bancada</h1>
        <EstadoTela tipo="vazio" titulo="Nenhuma ordem de serviço ainda">
          <p>Cadastre o primeiro aparelho que chegou na loja ou carregue alguns exemplos para conhecer o sistema.</p>
          <div className="estado__acoes">
            <Link to="/ordens/nova" className="botao botao--primario">Cadastrar primeira OS</Link>
            <button type="button" className="botao" onClick={carregarExemplos}>Carregar exemplos</button>
          </div>
        </EstadoTela>
      </section>
    );
  }

  const abertas = ordens.filter((os) => estaAberta(os.status));
  const atrasadas = abertas.filter((os) => situacaoPrazo(os, hoje).tipo === 'atrasada');
  const aguardando = abertas.filter((os) => os.status === 'aguardando');
  const vencidos = aguardando.filter((os) => situacaoOrcamento(os, hoje).tipo === 'vencido');
  const prontas = abertas.filter((os) => os.status === 'pronto');
  const naBancada = abertas.filter((os) => os.status === 'diagnostico' || os.status === 'recebido');

  const atencao = [...atrasadas, ...vencidos, ...prontas];

  return (
    <section className="secao" aria-labelledby="painel-titulo">
      <div className="pagina__cabeca">
        <h1 id="painel-titulo" className="pagina__titulo">Painel da bancada</h1>
        <Link to="/ordens/nova" className="botao botao--primario">+ Nova OS</Link>
      </div>

      <div className="indicadores">
        <CartaoIndicador titulo="OS abertas" valor={abertas.length} detalhe={`${naBancada.length} aguardando diagnóstico`} />
        <CartaoIndicador titulo="Atrasadas" valor={atrasadas.length} tom={atrasadas.length ? 'perigo' : 'sucesso'} detalhe="passaram da previsão de entrega" />
        <CartaoIndicador titulo="Aguardando cliente" valor={aguardando.length} tom={vencidos.length ? 'alerta' : 'normal'} detalhe={`${vencidos.length} orçamento(s) vencido(s)`} />
        <CartaoIndicador titulo="Prontas para retirada" valor={prontas.length} tom="sucesso" detalhe="avisar o cliente" />
      </div>

      <h2 className="secao__titulo">Precisa de atenção</h2>
      {atencao.length === 0 ? (
        <EstadoTela tipo="vazio" titulo="Tudo em dia por aqui">Nenhuma OS atrasada, vencida ou esperando retirada.</EstadoTela>
      ) : (
        <ul className="grade" aria-label="Ordens que precisam de atenção">
          {atencao.map((os) => (
            <li key={os.id}><CartaoOS os={os} hoje={hoje} /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
