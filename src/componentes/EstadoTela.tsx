import type { ReactNode } from 'react';

interface EstadoTelaProps {
  tipo: 'carregando' | 'erro' | 'vazio';
  titulo: string;
  children?: ReactNode;
  onTentarDeNovo?: () => void;
}

export function EstadoTela({ tipo, titulo, children, onTentarDeNovo }: EstadoTelaProps) {
  return (
    <div
      className={`estado estado--${tipo}`}
      role={tipo === 'erro' ? 'alert' : 'status'}
      aria-live={tipo === 'erro' ? 'assertive' : 'polite'}
    >
      {tipo === 'carregando' && <span className="estado__spinner" aria-hidden="true" />}
      <p className="estado__titulo">{titulo}</p>
      {children && <div className="estado__texto">{children}</div>}
      {tipo === 'erro' && onTentarDeNovo && (
        <button type="button" className="botao botao--primario" onClick={onTentarDeNovo}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}
