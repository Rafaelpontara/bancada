interface CartaoIndicadorProps {
  titulo: string;
  valor: string | number;
  detalhe?: string;
  tom?: 'normal' | 'alerta' | 'perigo' | 'sucesso';
}

export function CartaoIndicador({ titulo, valor, detalhe, tom = 'normal' }: CartaoIndicadorProps) {
  return (
    <div className={`indicador indicador--${tom}`}>
      <p className="indicador__titulo">{titulo}</p>
      <p className="indicador__valor">{valor}</p>
      {detalhe && <p className="indicador__detalhe">{detalhe}</p>}
    </div>
  );
}
