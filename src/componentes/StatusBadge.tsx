import { ROTULO_STATUS } from '../dominio/status';
import type { StatusOS } from '../tipos';

interface StatusBadgeProps {
  status: StatusOS;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge--${status}`}>{ROTULO_STATUS[status]}</span>;
}
