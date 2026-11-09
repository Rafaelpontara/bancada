import { useContext } from 'react';
import { ServicosContexto } from '../contexto/servicosContexto';

export function useServicosProprios() {
  const contexto = useContext(ServicosContexto);
  if (!contexto) {
    throw new Error('useServicosProprios precisa estar dentro de ServicosProvider.');
  }
  return contexto;
}
