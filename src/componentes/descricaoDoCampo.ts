export function descricaoDoCampo(id: string, erro?: string, dica?: string): string | undefined {
  if (erro) return `${id}-erro`;
  if (dica) return `${id}-dica`;
  return undefined;
}
