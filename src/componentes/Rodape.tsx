interface RodapeProps {
  hoje: string;
}

export function Rodape({ hoje }: RodapeProps) {
  return (
    <footer className="rodape">
      <p>
        Bancada · Ordens de serviço para assistência técnica · Programação para Web, UNIBALSAS
      </p>
      <p className="rodape__fraco">
        Dados salvos neste navegador. Data de referência: <time dateTime={hoje}>{hoje.split('-').reverse().join('/')}</time>
      </p>
    </footer>
  );
}
