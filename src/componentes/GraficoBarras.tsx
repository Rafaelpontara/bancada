interface Barra {
  rotulo: string;
  valor: number;
}

interface GraficoBarrasProps {
  titulo: string;
  barras: Barra[];
  formatar?: (valor: number) => string;
}

export function GraficoBarras({ titulo, barras, formatar = String }: GraficoBarrasProps) {
  const maior = Math.max(1, ...barras.map((b) => b.valor));
  const alturaLinha = 34;
  const larguraRotulo = 150;
  const larguraBarra = 260;
  const altura = barras.length * alturaLinha;

  return (
    <figure className="grafico">
      <figcaption className="grafico__titulo">{titulo}</figcaption>
      <svg
        viewBox={`0 0 ${larguraRotulo + larguraBarra + 50} ${altura}`}
        role="img"
        aria-label={`${titulo}: ${barras.map((b) => `${b.rotulo} ${formatar(b.valor)}`).join(', ')}`}
      >
        {barras.map((b, i) => {
          const y = i * alturaLinha;
          const largura = (b.valor / maior) * larguraBarra;
          return (
            <g key={b.rotulo} transform={`translate(0 ${y})`}>
              <text x={larguraRotulo - 10} y={alturaLinha / 2} className="grafico__rotulo" textAnchor="end" dominantBaseline="middle">
                {b.rotulo}
              </text>
              <rect x={larguraRotulo} y={8} width={larguraBarra} height={alturaLinha - 16} rx={4} className="grafico__trilho" />
              <rect x={larguraRotulo} y={8} width={Math.max(largura, b.valor ? 3 : 0)} height={alturaLinha - 16} rx={4} className="grafico__barra" />
              <text x={larguraRotulo + largura + 8} y={alturaLinha / 2} className="grafico__valor" dominantBaseline="middle">
                {formatar(b.valor)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
