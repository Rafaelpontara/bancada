interface CampoBuscaProps {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

export function CampoBusca({ id, rotulo, valor, onChange, placeholder }: CampoBuscaProps) {
  return (
    <div className="busca">
      <label htmlFor={id} className="campo__rotulo">
        {rotulo}
      </label>
      <input
        id={id}
        type="search"
        className="entrada"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
