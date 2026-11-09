import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampoFormulario } from '../componentes/CampoFormulario';
import { descricaoDoCampo } from '../componentes/descricaoDoCampo';
import { CATEGORIAS, ROTULO_CATEGORIA } from '../dominio/categorias';
import { montarServico, validarServico } from '../dominio/servicos';
import { useCatalogo } from '../hooks/useCatalogo';
import { useServicosProprios } from '../hooks/useServicosProprios';
import { useTituloPagina } from '../hooks/useTituloPagina';
import type { DadosFormularioServico } from '../tipos';

const ORDEM: (keyof DadosFormularioServico)[] = ['nome', 'categoria', 'preco', 'prazoDias', 'garantiaDias', 'descricao'];

const VAZIO: DadosFormularioServico = { nome: '', categoria: '', preco: '', prazoDias: '1', garantiaDias: '90', descricao: '' };

function novoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `proprio-${crypto.randomUUID()}`
    : `proprio-${Date.now()}`;
}

export function NovoServicoPage() {
  useTituloPagina('Novo serviço');
  const navegar = useNavigate();
  const { estado } = useCatalogo();
  const { servicosProprios, adicionarServico } = useServicosProprios();
  const [dados, setDados] = useState<DadosFormularioServico>(VAZIO);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const refs = useRef<Partial<Record<keyof DadosFormularioServico, HTMLElement | null>>>({});

  const existentes = estado.fase === 'pronto' ? estado.servicos : servicosProprios;
  const todosErros = validarServico(dados, existentes);
  const erro = (campo: keyof DadosFormularioServico) => (tentouEnviar ? todosErros[campo] : undefined);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setTentouEnviar(true);
    const primeiroInvalido = ORDEM.find((campo) => todosErros[campo]);
    if (primeiroInvalido) {
      refs.current[primeiroInvalido]?.focus();
      return;
    }
    adicionarServico(montarServico(dados, novoId()));
    navegar('/servicos');
  }

  const props = (campo: keyof DadosFormularioServico, dica?: string) => ({
    id: `servico-${campo}`,
    name: campo,
    value: dados[campo],
    onChange: (e: { target: { value: string } }) => setDados((atual) => ({ ...atual, [campo]: e.target.value })),
    'aria-invalid': Boolean(erro(campo)),
    'aria-describedby': descricaoDoCampo(`servico-${campo}`, erro(campo), dica),
    ref: (el: HTMLElement | null) => {
      refs.current[campo] = el;
    },
  });

  return (
    <section className="secao secao--estreita" aria-labelledby="novo-servico-titulo">
      <p className="migalha"><Link to="/servicos">← Catálogo de serviços</Link></p>
      <h1 id="novo-servico-titulo" className="pagina__titulo">Novo serviço</h1>
      <p className="texto-fraco">O serviço entra no catálogo e já pode ser usado nos orçamentos.</p>

      <form className="formulario" onSubmit={enviar} noValidate>
        <fieldset className="formulario__grupo">
          <legend>Serviço</legend>
          <CampoFormulario id="servico-nome" rotulo="Nome do serviço" erro={erro('nome')}>
            <input className="entrada" placeholder="ex.: Troca de tela iPhone 12" {...props('nome')} />
          </CampoFormulario>
          <CampoFormulario id="servico-categoria" rotulo="Categoria" erro={erro('categoria')}>
            <select className="entrada" {...props('categoria')}>
              <option value="">Selecione</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{ROTULO_CATEGORIA[c]}</option>
              ))}
            </select>
          </CampoFormulario>
          <CampoFormulario id="servico-preco" rotulo="Preço (R$)" erro={erro('preco')}>
            <input className="entrada" inputMode="decimal" placeholder="0,00" {...props('preco')} />
          </CampoFormulario>
          <div className="formulario__linha">
            <CampoFormulario id="servico-prazoDias" rotulo="Prazo (dias)" erro={erro('prazoDias')} dica="0 = feito na hora">
              <input className="entrada" inputMode="numeric" {...props('prazoDias', '0 = feito na hora')} />
            </CampoFormulario>
            <CampoFormulario id="servico-garantiaDias" rotulo="Garantia (dias)" erro={erro('garantiaDias')}>
              <input className="entrada" inputMode="numeric" {...props('garantiaDias')} />
            </CampoFormulario>
          </div>
          <CampoFormulario id="servico-descricao" rotulo="Descrição (opcional)">
            <textarea className="entrada" rows={2} {...props('descricao')} />
          </CampoFormulario>
        </fieldset>
        <div className="formulario__acoes">
          <button type="submit" className="botao botao--primario">Cadastrar serviço</button>
        </div>
      </form>
    </section>
  );
}
