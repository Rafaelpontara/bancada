import { useContext } from 'react';
import { OrdensContexto } from '../contexto/ordensContexto';

export function useOrdens() {
  const contexto = useContext(OrdensContexto);
  if (!contexto) {
    throw new Error('useOrdens precisa estar dentro de OrdensProvider.');
  }
  return contexto;
}
