/**
 * Aleatoriedad sembrada: la misma semilla da siempre la misma secuencia, en
 * cualquier navegador y en cualquier momento. Es lo que hace que el reto
 * diario sea el mismo para todos y que una partida se pueda compartir por
 * enlace. El `Math.random` del navegador no sirve: no se puede sembrar.
 */

/** Hash de 32 bits de una cadena (variante de xmur3). */
function sembrar(semilla: string): number {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i += 1) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Devuelve una función que da números en [0,1) (mulberry32). */
export function crearAleatorio(semilla: string): () => number {
  let estado = sembrar(semilla);
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function elegirUno<T>(items: readonly T[], aleatorio: () => number): T {
  if (items.length === 0) throw new Error("No se puede elegir de una lista vacía");
  return items[Math.floor(aleatorio() * items.length)]!;
}
