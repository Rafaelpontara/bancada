import type { ReactNode } from 'react';

interface CampoFormularioProps {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: string;
  children: ReactNode;
}

export function CampoFormulario({ id, rotulo, erro, dica, children }: CampoFormularioProps) {
  return (
    <div className={`campo ${erro ? 'campo--erro' : ''}`}>
      <label htmlFor={id} className="campo__rotulo">
        {rotulo}
      </label>
      {children}
      {dica && !erro && (
        <p className="campo__dica" id={`${id}-dica`}>
          {dica}
        </p>
      )}
      {erro && (
        <p className="campo__erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
