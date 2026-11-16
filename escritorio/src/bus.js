// Puente entre el núcleo de la app y los componentes de React.
// - SFA.bump(): algo cambió; los componentes suscritos se vuelven a pintar.
// - SFA.emit / SFA.on: eventos puntuales (por ejemplo, la sirena).
import { useEffect, useReducer } from 'react';

const oyentes = new Set();
const eventos = {};
let pendiente = false;

export const SFA = {
  bump() {
    if (pendiente) return;
    pendiente = true;
    queueMicrotask(() => { pendiente = false; oyentes.forEach(f => f()); });
  },
  on(evento, f) { (eventos[evento] = eventos[evento] || new Set()).add(f); return () => eventos[evento].delete(f); },
  emit(evento, dato) { (eventos[evento] || []).forEach(f => f(dato)); },
};

/** Vuelve a pintar el componente cada vez que el núcleo avisa un cambio. */
export function useLatido() {
  const [, forzar] = useReducer(n => n + 1, 0);
  useEffect(() => { oyentes.add(forzar); return () => oyentes.delete(forzar); }, []);
}

/** Escucha un evento del núcleo mientras el componente esté montado. */
export function useEvento(evento, f) {
  useEffect(() => SFA.on(evento, f), [evento, f]);
}
