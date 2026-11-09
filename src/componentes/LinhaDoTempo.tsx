import { formatarData } from '../dominio/datas';
import { ROTULO_STATUS } from '../dominio/status';
import type { EventoStatus } from '../tipos';

interface LinhaDoTempoProps {
  historico: EventoStatus[];
}

export function LinhaDoTempo({ historico }: LinhaDoTempoProps) {
  return (
    <ol className="linha-tempo">
      {historico.map((evento, i) => (
        <li key={`${evento.status}-${i}`} className="linha-tempo__item">
          <span className="linha-tempo__ponto" aria-hidden="true" />
          <span className="linha-tempo__status">{ROTULO_STATUS[evento.status]}</span>
          <time dateTime={evento.data} className="linha-tempo__data">
            {formatarData(evento.data)}
          </time>
        </li>
      ))}
    </ol>
  );
}
