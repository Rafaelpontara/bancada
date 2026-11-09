import { Link } from 'react-router-dom';
import { formatarData } from '../dominio/datas';
import { formatarReais } from '../dominio/dinheiro';
import { valorACobrar } from '../dominio/prazos';
import { calcularOrcamento } from '../dominio/orcamento';
import type { DataISO, OrdemServico } from '../tipos';
import { AlertasOS } from './AlertasOS';
import { StatusBadge } from './StatusBadge';

interface CartaoOSProps {
  os: OrdemServico;
  hoje: DataISO;
}

export function CartaoOS({ os, hoje }: CartaoOSProps) {
  const valor = os.itens.length ? calcularOrcamento(os.itens, os.descontoCentavos).total : valorACobrar(os);
  return (
    <article className="cartao-os">
      <div className="cartao-os__topo">
        <span className="cartao-os__numero">OS #{String(os.numero).padStart(4, '0')}</span>
        <StatusBadge status={os.status} />
      </div>
      <h3 className="cartao-os__titulo">
        <Link to={`/ordens/${os.id}`} className="link-cartao">
          {os.marca} {os.modelo}
        </Link>
      </h3>
      <p className="cartao-os__cliente">{os.cliente}</p>
      <p className="cartao-os__defeito">{os.defeito}</p>
      <AlertasOS os={os} hoje={hoje} />
      <div className="cartao-os__rodape">
        <span>Entrada {formatarData(os.dataEntrada)}</span>
        <strong>{valor ? formatarReais(valor) : 'Sem orçamento'}</strong>
      </div>
    </article>
  );
}
