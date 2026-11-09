import { Link } from 'react-router-dom';
import { useTituloPagina } from '../hooks/useTituloPagina';

export function NaoEncontradaPage() {
  useTituloPagina('Página não encontrada');
  return (
    <section className="secao nao-encontrada" aria-labelledby="nf-titulo">
      <p className="nao-encontrada__codigo" aria-hidden="true">404</p>
      <h1 id="nf-titulo" className="pagina__titulo">Página não encontrada</h1>
      <p className="texto-fraco">Esse endereço não existe na Bancada.</p>
      <Link to="/" className="botao botao--primario">Voltar para o início</Link>
    </section>
  );
}
