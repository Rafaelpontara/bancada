import { NavLink } from 'react-router-dom';
import type { Tema } from '../hooks/useTema';

interface CabecalhoProps {
  tema: Tema;
  onAlternarTema: () => void;
}

const LINKS = [
  { para: '/', texto: 'Painel' },
  { para: '/ordens', texto: 'Ordens' },
  { para: '/servicos', texto: 'Serviços' },
  { para: '/relatorio', texto: 'Relatório' },
];

export function Cabecalho({ tema, onAlternarTema }: CabecalhoProps) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__interno">
        <NavLink to="/" className="marca" aria-label="Bancada, ir para o painel">
          <span className="marca__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 18.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="m9.5 9 2 2 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="marca__nome">Bancada</span>
        </NavLink>

        <nav aria-label="Principal" className="nav">
          <ul>
            {LINKS.map((link) => (
              <li key={link.para}>
                <NavLink to={link.para} end={link.para === '/'}>
                  {link.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cabecalho__acoes">
          <NavLink to="/ordens/nova" className="botao botao--primario botao--pequeno">
            + Nova OS
          </NavLink>
          <button
            type="button"
            className="botao botao--icone"
            onClick={onAlternarTema}
            aria-label={tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            title={tema === 'claro' ? 'Modo escuro' : 'Modo claro'}
          >
            <span aria-hidden="true">{tema === 'claro' ? '☾' : '☀'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
