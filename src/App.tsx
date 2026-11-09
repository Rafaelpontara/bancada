import { HashRouter, Route, Routes } from 'react-router-dom';
import { Cabecalho } from './componentes/Cabecalho';
import { Rodape } from './componentes/Rodape';
import { OrdensProvider } from './contexto/OrdensProvider';
import { ServicosProvider } from './contexto/ServicosProvider';
import { useOrdens } from './hooks/useOrdens';
import { useTema } from './hooks/useTema';
import { DetalheOrdemPage } from './paginas/DetalheOrdemPage';
import { EditarOrdemPage } from './paginas/EditarOrdemPage';
import { NaoEncontradaPage } from './paginas/NaoEncontradaPage';
import { NovaOrdemPage } from './paginas/NovaOrdemPage';
import { NovoServicoPage } from './paginas/NovoServicoPage';
import { OrdensPage } from './paginas/OrdensPage';
import { PainelPage } from './paginas/PainelPage';
import { RelatorioPage } from './paginas/RelatorioPage';
import { ServicosPage } from './paginas/ServicosPage';

function Layout() {
  const { tema, alternar } = useTema();
  const { hoje } = useOrdens();
  return (
    <>
      <a href="#conteudo" className="pular-link" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>
        Pular para o conteúdo
      </a>
      <Cabecalho tema={tema} onAlternarTema={alternar} />
      <main id="conteudo" className="conteudo" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PainelPage />} />
          <Route path="/ordens" element={<OrdensPage />} />
          <Route path="/ordens/nova" element={<NovaOrdemPage />} />
          <Route path="/ordens/:id" element={<DetalheOrdemPage />} />
          <Route path="/ordens/:id/editar" element={<EditarOrdemPage />} />
          <Route path="/servicos" element={<ServicosPage />} />
          <Route path="/servicos/novo" element={<NovoServicoPage />} />
          <Route path="/relatorio" element={<RelatorioPage />} />
          <Route path="*" element={<NaoEncontradaPage />} />
        </Routes>
      </main>
      <Rodape hoje={hoje} />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <OrdensProvider>
        <ServicosProvider>
          <Layout />
        </ServicosProvider>
      </OrdensProvider>
    </HashRouter>
  );
}
