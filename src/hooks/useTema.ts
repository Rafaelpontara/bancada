import { useEffect, useState } from 'react';

export type Tema = 'claro' | 'escuro';
const CHAVE = 'bancada:tema';

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial);
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {}
  }, [tema]);
  const alternar = () => setTema((t) => (t === 'claro' ? 'escuro' : 'claro'));
  return { tema, alternar };
}
