import { formatarData } from '../dominio/datas';
import { situacaoGarantia, situacaoOrcamento, situacaoPrazo } from '../dominio/prazos';
import type { DataISO, OrdemServico } from '../tipos';

interface AlertasOSProps {
  os: OrdemServico;
  hoje: DataISO;
}

function plural(n: number, palavra: string) {
  return `${n} ${palavra}${n === 1 ? '' : 's'}`;
}

export function AlertasOS({ os, hoje }: AlertasOSProps) {
  const chips: { texto: string; tom: string }[] = [];

  const prazo = situacaoPrazo(os, hoje);
  if (prazo.tipo === 'atrasada') chips.push({ texto: `Atrasada ${plural(prazo.diasAtraso, 'dia')}`, tom: 'perigo' });
  if (prazo.tipo === 'no-prazo')
    chips.push({
      texto: prazo.diasRestantes === 0 ? 'Entrega prevista para hoje' : `Entrega em ${formatarData(prazo.previsao)}`,
      tom: 'normal',
    });

  if (os.status === 'aguardando') {
    const orc = situacaoOrcamento(os, hoje);
    if (orc.tipo === 'vencido') chips.push({ texto: `Orçamento vencido em ${formatarData(orc.validoAte)}`, tom: 'alerta' });
    if (orc.tipo === 'valido')
      chips.push({ texto: `Orçamento vale até ${formatarData(orc.validoAte)} (${plural(orc.diasRestantes, 'dia')})`, tom: 'normal' });
  }

  const garantia = situacaoGarantia(os, hoje);
  if (garantia.tipo === 'ativa')
    chips.push({ texto: `Em garantia, ${garantia.diasRestantes === 1 ? 'falta 1 dia' : `faltam ${garantia.diasRestantes} dias`}`, tom: 'sucesso' });
  if (garantia.tipo === 'expirada') chips.push({ texto: `Garantia expirou em ${formatarData(garantia.validaAte)}`, tom: 'fraco' });

  if (chips.length === 0) return null;
  return (
    <ul className="chips" aria-label="Situação">
      {chips.map((c) => (
        <li key={c.texto} className={`chip chip--${c.tom}`}>
          {c.texto}
        </li>
      ))}
    </ul>
  );
}
