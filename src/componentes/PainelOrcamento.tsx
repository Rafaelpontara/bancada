import { useState } from 'react';
import type { FormEvent } from 'react';
import { formatarReais, reaisParaCentavos } from '../dominio/dinheiro';
import { calcularOrcamento, descontoMaximo } from '../dominio/orcamento';
import { podeEditarOrcamento } from '../dominio/status';
import { useCatalogo } from '../hooks/useCatalogo';
import { useOrdens } from '../hooks/useOrdens';
import type { OrdemServico } from '../tipos';
import { CampoFormulario } from './CampoFormulario';
import { EstadoTela } from './EstadoTela';

interface PainelOrcamentoProps {
  os: OrdemServico;
}

function SeletorServico({ os }: PainelOrcamentoProps) {
  const { estado, tentarDeNovo } = useCatalogo();
  const { adicionarServico } = useOrdens();
  const [escolhido, setEscolhido] = useState('');

  if (estado.fase === 'carregando') return <EstadoTela tipo="carregando" titulo="Carregando catálogo de serviços…" />;
  if (estado.fase === 'erro')
    return (
      <EstadoTela tipo="erro" titulo="Não foi possível carregar o catálogo" onTentarDeNovo={tentarDeNovo}>
        {estado.mensagem}
      </EstadoTela>
    );
  if (estado.servicos.length === 0) return <EstadoTela tipo="vazio" titulo="O catálogo de serviços está vazio" />;

  function adicionar(e: FormEvent) {
    e.preventDefault();
    const servico = estado.fase === 'pronto' ? estado.servicos.find((s) => s.id === escolhido) : undefined;
    if (servico) {
      adicionarServico(os.id, servico);
      setEscolhido('');
    }
  }

  return (
    <form className="seletor" onSubmit={adicionar}>
      <label htmlFor="servico" className="campo__rotulo">
        Adicionar serviço do catálogo
      </label>
      <div className="seletor__linha">
        <select id="servico" className="entrada" value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
          <option value="">Selecione um serviço</option>
          {estado.servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} · {formatarReais(s.precoCentavos)}
            </option>
          ))}
        </select>
        <button type="submit" className="botao" disabled={!escolhido}>
          Adicionar
        </button>
      </div>
    </form>
  );
}

function CampoDesconto({ os }: PainelOrcamentoProps) {
  const { definirDesconto } = useOrdens();
  const [texto, setTexto] = useState(os.descontoCentavos ? (os.descontoCentavos / 100).toFixed(2).replace('.', ',') : '');
  const [erro, setErro] = useState<string>();
  const [salvo, setSalvo] = useState(false);
  const limite = descontoMaximo(calcularOrcamento(os.itens, 0).subtotal);

  function aplicar(e: FormEvent) {
    e.preventDefault();
    setSalvo(false);
    const centavos = texto.trim() === '' ? 0 : reaisParaCentavos(texto);
    if (centavos === null) {
      setErro('Digite um valor como 20,00');
      return;
    }
    const r = definirDesconto(os.id, centavos);
    setErro(r.ok ? undefined : r.erro);
    setSalvo(r.ok);
  }

  return (
    <form className="desconto" onSubmit={aplicar} noValidate>
      <CampoFormulario id="desconto" rotulo="Desconto (R$)" erro={erro} dica={`Até 10%: ${formatarReais(limite)}`}>
        <div className="seletor__linha">
          <input
            id="desconto"
            className="entrada"
            inputMode="decimal"
            placeholder="0,00"
            value={texto}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'desconto-erro' : 'desconto-dica'}
            onChange={(e) => {
              setTexto(e.target.value);
              setSalvo(false);
            }}
          />
          <button type="submit" className="botao">
            Aplicar
          </button>
        </div>
      </CampoFormulario>
      {salvo && (
        <p className="texto-sucesso" role="status">
          Desconto aplicado.
        </p>
      )}
    </form>
  );
}

export function PainelOrcamento({ os }: PainelOrcamentoProps) {
  const { removerServico } = useOrdens();
  const editavel = podeEditarOrcamento(os.status);
  const resumo = calcularOrcamento(os.itens, os.descontoCentavos);

  return (
    <section className="painel" aria-labelledby="orcamento-titulo">
      <h2 id="orcamento-titulo" className="painel__titulo">
        Orçamento
      </h2>

      {os.itens.length === 0 ? (
        <p className="texto-fraco">Nenhum serviço adicionado ainda.</p>
      ) : (
        <table className="tabela">
          <caption className="sr-only">Serviços do orçamento</caption>
          <thead>
            <tr>
              <th scope="col">Serviço</th>
              <th scope="col">Prazo</th>
              <th scope="col">Garantia</th>
              <th scope="col" className="num">Valor</th>
              {editavel && <th scope="col"><span className="sr-only">Ações</span></th>}
            </tr>
          </thead>
          <tbody>
            {os.itens.map((item, i) => (
              <tr key={`${item.servicoId}-${i}`}>
                <td>{item.nome}</td>
                <td>{item.prazoDias === 0 ? 'Na hora' : `${item.prazoDias} d`}</td>
                <td>{item.garantiaDias} d</td>
                <td className="num">{formatarReais(item.precoCentavos)}</td>
                {editavel && (
                  <td>
                    <button type="button" className="botao botao--fantasma botao--pequeno" onClick={() => removerServico(os.id, i)} aria-label={`Remover ${item.nome}`}>
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <dl className="totais">
        <div><dt>Subtotal</dt><dd>{formatarReais(resumo.subtotal)}</dd></div>
        <div><dt>Desconto</dt><dd>− {formatarReais(resumo.desconto)}</dd></div>
        <div className="totais__total"><dt>Total</dt><dd>{formatarReais(resumo.total)}</dd></div>
        <div><dt>Prazo após aprovação</dt><dd>{resumo.prazoDias} dia(s)</dd></div>
        <div><dt>Garantia</dt><dd>{resumo.garantiaDias} dias</dd></div>
      </dl>

      {editavel ? (
        <div className="painel__edicao">
          <SeletorServico os={os} />
          {os.itens.length > 0 && <CampoDesconto key={os.itens.length} os={os} />}
        </div>
      ) : (
        os.status === 'recebido' && <p className="texto-fraco">Inicie o diagnóstico para montar o orçamento.</p>
      )}
    </section>
  );
}
