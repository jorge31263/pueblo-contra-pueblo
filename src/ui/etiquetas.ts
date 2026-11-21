import type { Metrica } from "../dominio/tipos.js";

/** Lo que se pregunta en cada ronda, anunciado antes de elegir. */
export function etiquetaMetrica(metrica: Metrica): string {
  return {
    habitantes: "¿Cuál tiene más habitantes?",
    altitud: "¿Cuál está a más altitud?",
    extension: "¿Cuál tiene más extensión?",
  }[metrica];
}

const ESPANOL = "es-ES";

/** El valor tal y como lo lee una persona: 1.066 m, 85,72 km², 305 habitantes. */
export function formatearValor(valor: number, metrica: Metrica): string {
  if (metrica === "habitantes") {
    const palabra = valor === 1 ? "habitante" : "habitantes";
    return `${valor.toLocaleString(ESPANOL)} ${palabra}`;
  }
  if (metrica === "altitud") return `${valor.toLocaleString(ESPANOL)} m`;
  return `${valor.toLocaleString(ESPANOL, { maximumFractionDigits: 2 })} km²`;
}
