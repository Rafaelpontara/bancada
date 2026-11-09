import { describe, expect, it } from 'vitest';
import { diasEntre, ehDataValida, formatarData, somarDias } from './datas';
import { formatarReais, reaisParaCentavos } from './dinheiro';

describe('datas', () => {
  it('conta dias sem errar por causa do fuso horário', () => {
    expect(diasEntre('2026-10-01', '2026-11-09')).toBe(39);
    expect(diasEntre('2026-11-09', '2026-11-08')).toBe(-1);
  });

  it('soma dias atravessando meses', () => {
    expect(somarDias('2026-08-15', 90)).toBe('2026-11-13');
    expect(somarDias('2026-11-01', 7)).toBe('2026-11-08');
  });

  it('valida e formata datas', () => {
    expect(ehDataValida('2026-02-30')).toBe(false);
    expect(ehDataValida('2026-11-09')).toBe(true);
    expect(formatarData('2026-11-09')).toBe('09/11/2026');
  });
});

describe('dinheiro', () => {
  it('formata centavos no padrão brasileiro', () => {
    expect(formatarReais(2875)).toBe('R$ 28,75');
    expect(formatarReais(125000)).toBe('R$ 1.250,00');
    expect(formatarReais(0)).toBe('R$ 0,00');
  });

  it('converte o texto digitado em centavos', () => {
    expect(reaisParaCentavos('38,50')).toBe(3850);
    expect(reaisParaCentavos('1.250,00')).toBe(125000);
    expect(reaisParaCentavos('abc')).toBeNull();
  });
});
