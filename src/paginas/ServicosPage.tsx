import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CampoBusca } from '../componentes/CampoBusca';
import { EstadoTela } from '../componentes/EstadoTela';
import { CATEGORIAS, ROTULO_CATEGORIA } from '../dominio/categorias';
import { formatarReais } from '../dominio/dinheiro';
import { useCatalogo } from '../hooks/useCatalogo';
import { useServicosProprios } from '../hooks/useServicosProprios';
import { useTituloPagina } from '../hooks/useTituloPagina';
import type { CategoriaServico } from '../tipos';

export function ServicosPage() {
  useTituloPagina('Serviços');
  const { estado, tentarDeNovo } = useCatalogo();
  const { excluirServico } = useServicosProprios();
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<CategoriaServico | ''>('');

  const servicos = useMemo(() => {
    if (estado.fase !== 'pronto') return [];
    const termo = busca.trim().toLowerCase();
    return estado.servicos
      .filter((s) => !categoria || s.categoria === categoria)
      .filter((s) => !termo || s.nome.toLowerCase().includes(termo));
  }, [estado, busca, categoria]);

  return (
    <section className="secao" aria-labelledby="servicos-titulo">
      <div className="pagina__cabeca">
        <h1 id="servicos-titulo" className="pagina__titulo">Catálogo de serviços</h1>
        <Link to="/servicos/novo" className="botao botao--primario">+ Novo serviço</Link>
      </div>
      <p className="texto-fraco">Tabela de preços, prazos e garantias usada para montar os orçamentos.</p>

      <div className="filtros">
        <CampoBusca id="busca-servico" rotulo="Buscar serviço" valor={busca} onChange={setBusca} placeholder="ex.: tela, bateria" />
        <div>
          <label htmlFor="filtro-categoria" className="campo__rotulo">Categoria</label>
          <select id="filtro-categoria" className="entrada" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaServico | '')}>
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{ROTULO_CATEGORIA[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {estado.fase === 'carregando' && <EstadoTela tipo="carregando" titulo="Carregando catálogo…" />}
      {estado.fase === 'erro' && (
        <EstadoTela tipo="erro" titulo="Não foi possível carregar o catálogo" onTentarDeNovo={tentarDeNovo}>
          {estado.mensagem}
        </EstadoTela>
      )}
      {estado.fase === 'pronto' &&
        (servicos.length === 0 ? (
          <EstadoTela tipo="vazio" titulo="Nenhum serviço encontrado">Tente outro termo ou outra categoria.</EstadoTela>
        ) : (
          <ul className="grade grade--servicos" aria-label="Serviços">
            {servicos.map((s) => (
              <li key={s.id} className="servico">
                <div className="chips">
                  <span className="chip chip--cat">{ROTULO_CATEGORIA[s.categoria]}</span>
                  {s.proprio && <span className="chip chip--cat chip--sucesso">Cadastrado na loja</span>}
                </div>
                <h2 className="servico__nome">{s.nome}</h2>
                <p className="servico__descricao">{s.descricao}</p>
                <dl className="servico__dados">
                  <div><dt>Preço</dt><dd>{formatarReais(s.precoCentavos)}</dd></div>
                  <div><dt>Prazo</dt><dd>{s.prazoDias === 0 ? 'Na hora' : `${s.prazoDias} dia(s)`}</dd></div>
                  <div><dt>Garantia</dt><dd>{s.garantiaDias} dias</dd></div>
                </dl>
                {s.proprio &&
                  (excluindo === s.id ? (
                    <div className="servico__acoes" role="group" aria-label={`Confirmar exclusão de ${s.nome}`}>
                      <button type="button" className="botao botao--perigo botao--pequeno" onClick={() => { excluirServico(s.id); setExcluindo(null); }}>
                        Sim, excluir
                      </button>
                      <button type="button" className="botao botao--pequeno" onClick={() => setExcluindo(null)}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="servico__acoes">
                      <button type="button" className="botao botao--fantasma botao--pequeno" onClick={() => setExcluindo(s.id)} aria-label={`Excluir ${s.nome}`}>
                        Excluir
                      </button>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}
