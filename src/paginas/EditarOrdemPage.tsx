import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EstadoTela } from '../componentes/EstadoTela';
import { FormularioOS } from '../componentes/FormularioOS';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';

export function EditarOrdemPage() {
  const { id = '' } = useParams();
  const { obterOrdem, atualizarDados, excluirOrdem } = useOrdens();
  const navegar = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const os = obterOrdem(id);
  useTituloPagina(os ? `Editar OS #${os.numero}` : 'OS não encontrada');

  if (!os) {
    return (
      <section className="secao">
        <EstadoTela tipo="vazio" titulo="Ordem de serviço não encontrada">
          <Link to="/ordens">Voltar para a lista</Link>.
        </EstadoTela>
      </section>
    );
  }

  return (
    <section className="secao secao--estreita" aria-labelledby="editar-titulo">
      <p className="migalha"><Link to={`/ordens/${os.id}`}>← Voltar para a OS #{os.numero}</Link></p>
      <h1 id="editar-titulo" className="pagina__titulo">Editar OS #{os.numero}</h1>
      <FormularioOS
        inicial={{
          cliente: os.cliente,
          telefone: os.telefone,
          marca: os.marca,
          modelo: os.modelo,
          imei: os.imei,
          defeito: os.defeito,
          dataEntrada: os.dataEntrada,
        }}
        idAtual={os.id}
        textoBotao="Salvar alterações"
        onSalvar={(dados) => {
          atualizarDados(os.id, dados);
          navegar(`/ordens/${os.id}`);
        }}
      />

      <section className="zona-perigo" aria-labelledby="excluir-titulo">
        <h2 id="excluir-titulo" className="painel__titulo">Excluir OS</h2>
        {!confirmando ? (
          <button type="button" className="botao botao--perigo" onClick={() => setConfirmando(true)}>
            Excluir esta OS
          </button>
        ) : (
          <div role="alertdialog" aria-labelledby="confirmar-texto" className="confirmacao">
            <p id="confirmar-texto">
              Excluir a OS #{os.numero} de {os.cliente}? Isso não pode ser desfeito.
            </p>
            <div className="estado__acoes">
              <button
                type="button"
                className="botao botao--perigo"
                autoFocus
                onClick={() => {
                  excluirOrdem(os.id);
                  navegar('/ordens');
                }}
              >
                Sim, excluir
              </button>
              <button type="button" className="botao" onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
