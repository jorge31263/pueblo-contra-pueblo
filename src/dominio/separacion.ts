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

export function estanSeparados(a: Pueblo, b: Pueblo, metrica: Metrica, racha: number): boolean {
  const uno = valor(a, metrica);
  const otro = valor(b, metrica);
  if (uno === otro) return false;

  const mayor = Math.max(uno, otro);
  const menor = Math.min(uno, otro);
  const exigida = separacionExigida(metrica, racha);

  if (PARAMETROS[metrica].modo === "metros") return mayor - menor >= exigida;

  // Una proporción con el menor en cero sería infinita: cualquier par contra
  // un cero pasaría siempre, que es justo lo que no queremos.
  if (menor <= 0) return mayor > 0;
  return mayor / menor >= exigida;
}
