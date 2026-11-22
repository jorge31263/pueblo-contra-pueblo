/**
 * El modo sale del hash de la URL, que es lo único que el juego necesita para
 * enrutar: `#libre=abc123` juega esa semilla, cualquier otra cosa es el reto
 * diario. Una semilla con pinta rara se ignora en vez de dar una pantalla en
 * blanco.
 */
export type Modo = "diario" | "libre";

export type ModoElegido = { modo: Modo; semilla?: string };

const SEMILLA_VALIDA = /^[a-z0-9]{3,16}$/i;

const PREFIJO = "libre=";

export function modoDesdeUrl(hash: string): ModoElegido {
  const limpio = hash.replace(/^#/, "");
  // El nombre del modo no distingue mayúsculas porque algunos clientes
  // normalizan el hash al reenviar un enlace. La semilla sí las distingue.
  if (limpio.toLowerCase() === "libre") return { modo: "libre" };
  if (limpio.slice(0, PREFIJO.length).toLowerCase() !== PREFIJO) return { modo: "diario" };

  const semilla = limpio.slice(PREFIJO.length);
  return SEMILLA_VALIDA.test(semilla) ? { modo: "libre", semilla } : { modo: "diario" };
}

export function semillaAleatoria(): string {
  return Math.random().toString(36).slice(2, 10);
}
