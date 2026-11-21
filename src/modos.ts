/**
 * El modo sale del hash de la URL, que es lo único que el juego necesita para
 * enrutar: `#libre=abc123` juega esa semilla, cualquier otra cosa es el reto
 * diario. Una semilla con pinta rara se ignora en vez de dar una pantalla en
 * blanco.
 */
export type Modo = "diario" | "libre";

export type ModoElegido = { modo: Modo; semilla?: string };

const SEMILLA_VALIDA = /^[a-z0-9]{3,16}$/i;

export function modoDesdeUrl(hash: string): ModoElegido {
  const limpio = hash.replace(/^#/, "");
  if (limpio === "libre") return { modo: "libre" };
  if (!limpio.startsWith("libre=")) return { modo: "diario" };

  const semilla = limpio.slice("libre=".length);
  return SEMILLA_VALIDA.test(semilla) ? { modo: "libre", semilla } : { modo: "diario" };
}

export function semillaAleatoria(): string {
  return Math.random().toString(36).slice(2, 10);
}
