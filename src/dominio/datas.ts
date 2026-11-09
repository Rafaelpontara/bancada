import type { DataISO } from '../tipos';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

// new Date("2026-10-01") vira meia-noite UTC (dia anterior aqui), por isso Date.UTC
function paraUTC(data: DataISO): number {
  const [ano, mes, dia] = data.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

export function ehDataValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

export function diasEntre(inicio: DataISO, fim: DataISO): number {
  return Math.round((paraUTC(fim) - paraUTC(inicio)) / UM_DIA_MS);
}

export function somarDias(data: DataISO, dias: number): DataISO {
  return new Date(paraUTC(data) + dias * UM_DIA_MS).toISOString().slice(0, 10);
}

export function hojeISO(agora: Date): DataISO {
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function formatarData(data: DataISO): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}
