import type { Metrica } from "./tipos.js";

/**
 * La curva de dificultad del juego, toda en un sitio. Son un primer tanteo:
 * hay que jugar para afinarlos, y por eso viven aquí y no repartidos por el
 * código.
 *
 * `modo` dice cómo se mide la separación entre los dos valores de un par: por
 * proporción (el mayor dividido entre el menor) o por diferencia en metros.
 * La altitud va aparte porque la proporción ahí engaña (ADR 0004).
 */
export type ModoSeparacion = "proporcion" | "metros";

export type ParametroMetrica = {
  modo: ModoSeparacion;
  alPrincipio: number;
  alFinal: number;
};

export const PARAMETROS: Record<Metrica, ParametroMetrica> = {
  habitantes: { modo: "proporcion", alPrincipio: 2.5, alFinal: 1.1 },
  extension: { modo: "proporcion", alPrincipio: 2.5, alFinal: 1.1 },
  altitud: { modo: "metros", alPrincipio: 400, alFinal: 40 },
};

/** La racha a partir de la cual la exigencia ya no se estrecha más. */
export const RACHA_MAS_DIFICIL = 15;

/** Cuántos pares se sortean antes de relajar la exigencia un escalón. */
export const INTENTOS_POR_NIVEL = 200;

/** Lo que tarda el revelado de un acierto antes de pasar de ronda. */
export const MILISEGUNDOS_DE_REVELADO = 1200;
