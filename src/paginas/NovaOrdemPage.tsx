import { useNavigate } from 'react-router-dom';
import { FormularioOS } from '../componentes/FormularioOS';
import { useOrdens } from '../hooks/useOrdens';
import { useTituloPagina } from '../hooks/useTituloPagina';

export function NovaOrdemPage() {
  useTituloPagina('Nova OS');
  const { criarOrdem, hoje } = useOrdens();
  const navegar = useNavigate();

  return (
    <section className="secao secao--estreita" aria-labelledby="nova-titulo">
      <h1 id="nova-titulo" className="pagina__titulo">Nova ordem de serviço</h1>
      <p className="texto-fraco">Registre o aparelho que chegou no balcão. O orçamento é montado depois, no diagnóstico.</p>
      <FormularioOS
        inicial={{ cliente: '', telefone: '', marca: '', modelo: '', imei: '', defeito: '', dataEntrada: hoje }}
        idAtual={null}
        textoBotao="Cadastrar OS"
        onSalvar={(dados) => {
          const nova = criarOrdem(dados);
          navegar(`/ordens/${nova.id}`);
        }}
      />
    </section>
  );
}
