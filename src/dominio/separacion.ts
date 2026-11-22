import type { Metrica, Pueblo } from "./tipos.js";
import { PARAMETROS, RACHA_MAS_DIFICIL } from "./parametros.js";

/**
 * Un par solo es una pregunta si sus dos valores están lo bastante separados.
 * "Lo bastante" se estrecha conforme crece la racha: la primera ronda se pone
 * a huevo y la decimoquinta, finísima (ADR 0004).
 */
export function separacionExigida(metrica: Metrica, racha: number): number {
  const { alPrincipio, alFinal } = PARAMETROS[metrica];
  const avance = Math.min(Math.max(racha, 0), RACHA_MAS_DIFICIL) / RACHA_MAS_DIFICIL;
  const valor = alPrincipio + (alFinal - alPrincipio) * avance;
  return Math.round(valor * 1000) / 1000;
}

function valor(pueblo: Pueblo, metrica: Metrica): number {
  return pueblo[metrica];
}

/**
 * Los escalones por los que baja la exigencia cuando no aparece ningún par.
 * Una proporción se relaja acercándola a 1 y no multiplicándola, porque un
 * umbral menor que 1 aceptaría cualquier par, incluido el que no separa nada.
 */
const FACTORES = [1, 0.5, 0.2];

export function umbralesDeRelajacion(metrica: Metrica, racha: number): number[] {
  const exigida = separacionExigida(metrica, racha);
  const esProporcion = PARAMETROS[metrica].modo === "proporcion";
  return FACTORES.map((f) =>
    esProporcion
      ? Math.round((1 + (exigida - 1) * f) * 10000) / 10000
      : Math.round(exigida * f * 1000) / 1000,
  );
}

export function separadosPor(a: Pueblo, b: Pueblo, metrica: Metrica, umbral: number): boolean {
  const uno = valor(a, metrica);
  const otro = valor(b, metrica);
  if (uno === otro) return false;

  const mayor = Math.max(uno, otro);
  const menor = Math.min(uno, otro);

  if (PARAMETROS[metrica].modo === "metros") return mayor - menor >= umbral;

  // Una proporción con el menor en cero sería infinita: cualquier par contra
  // un cero pasaría siempre, que es justo lo que no queremos.
  if (menor <= 0) return mayor > 0;
  return mayor / menor >= umbral;
}

export function estanSeparados(a: Pueblo, b: Pueblo, metrica: Metrica, racha: number): boolean {
  return separadosPor(a, b, metrica, separacionExigida(metrica, racha));
}
