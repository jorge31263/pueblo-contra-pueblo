import { describe, it, expect } from "vitest";
import type { Pueblo } from "./tipos.js";
import { separacionExigida, estanSeparados, umbralesDeRelajacion } from "./separacion.js";

const pueblo = (p: Partial<Pueblo>): Pueblo => ({
  id: "00000", nombre: "X", provincia: "Y", habitantes: 100, altitud: 100, extension: 10, ...p,
});
const hab = (habitantes: number) => pueblo({ habitantes });
const alt = (altitud: number) => pueblo({ altitud });
const ext = (extension: number) => pueblo({ extension });

describe("separacionExigida", () => {
  it("parte de los valores del spec en la racha 0", () => {
    expect(separacionExigida("habitantes", 0)).toBe(2.5);
    expect(separacionExigida("extension", 0)).toBe(2.5);
    expect(separacionExigida("altitud", 0)).toBe(400);
  });

  it("llega al valor final en la racha 15 y no sigue bajando", () => {
    expect(separacionExigida("habitantes", 15)).toBe(1.1);
    expect(separacionExigida("habitantes", 40)).toBe(1.1);
    expect(separacionExigida("altitud", 15)).toBe(40);
    expect(separacionExigida("altitud", 99)).toBe(40);
  });

  it("interpola de forma monótona decreciente", () => {
    for (const metrica of ["habitantes", "altitud", "extension"] as const) {
      const valores = Array.from({ length: 21 }, (_, racha) => separacionExigida(metrica, racha));
      for (let i = 1; i < valores.length; i += 1) {
        expect(valores[i]!).toBeLessThanOrEqual(valores[i - 1]!);
      }
    }
  });

  it("a mitad de camino exige algo intermedio", () => {
    const mitad = separacionExigida("altitud", 7);
    expect(mitad).toBeLessThan(400);
    expect(mitad).toBeGreaterThan(40);
  });
});

describe("estanSeparados", () => {
  it("mide los habitantes por proporción", () => {
    expect(estanSeparados(hab(100), hab(300), "habitantes", 0)).toBe(true);
    expect(estanSeparados(hab(100), hab(200), "habitantes", 0)).toBe(false);
  });

  it("mide la extensión por proporción", () => {
    expect(estanSeparados(ext(10), ext(30), "extension", 0)).toBe(true);
    expect(estanSeparados(ext(10), ext(20), "extension", 0)).toBe(false);
  });

  it("mide la altitud por diferencia en metros, no por proporción", () => {
    // 2 y 6 guardan la misma proporción que 400 y 1.200, y no se parecen en nada.
    expect(estanSeparados(alt(2), alt(6), "altitud", 0)).toBe(false);
    expect(estanSeparados(alt(400), alt(1200), "altitud", 0)).toBe(true);
  });

  it("trata la altitud cero sin dividir por ella", () => {
    expect(estanSeparados(alt(0), alt(500), "altitud", 0)).toBe(true);
    expect(estanSeparados(alt(0), alt(10), "altitud", 0)).toBe(false);
  });

  it("rechaza siempre los valores iguales, por alta que sea la racha", () => {
    expect(estanSeparados(alt(500), alt(500), "altitud", 99)).toBe(false);
    expect(estanSeparados(hab(500), hab(500), "habitantes", 99)).toBe(false);
    expect(estanSeparados(ext(5), ext(5), "extension", 99)).toBe(false);
  });

  it("no depende del orden de los dos pueblos", () => {
    expect(estanSeparados(hab(100), hab(300), "habitantes", 0))
      .toBe(estanSeparados(hab(300), hab(100), "habitantes", 0));
    expect(estanSeparados(alt(10), alt(500), "altitud", 0))
      .toBe(estanSeparados(alt(500), alt(10), "altitud", 0));
  });

  it("con la racha alta acepta pares que con la racha 0 rechazaba", () => {
    expect(estanSeparados(hab(100), hab(150), "habitantes", 0)).toBe(false);
    expect(estanSeparados(hab(100), hab(150), "habitantes", 20)).toBe(true);
  });

  it("no divide por cero cuando un municipio tiene extensión mínima", () => {
    expect(estanSeparados(ext(0.01), ext(100), "extension", 0)).toBe(true);
  });
});

describe("umbralesDeRelajacion", () => {
  it("baja de verdad en cada escalón, también con la racha saturada", () => {
    for (const racha of [0, 7, 15, 30]) {
      for (const metrica of ["habitantes", "altitud", "extension"] as const) {
        const escalones = umbralesDeRelajacion(metrica, racha);
        expect(escalones.length).toBeGreaterThan(1);
        for (let i = 1; i < escalones.length; i += 1) {
          expect(escalones[i]!).toBeLessThan(escalones[i - 1]!);
        }
      }
    }
  });

  it("empieza por la exigencia de esa racha", () => {
    expect(umbralesDeRelajacion("altitud", 0)[0]).toBe(separacionExigida("altitud", 0));
  });

  it("al relajar una proporción nunca baja de 1, que aceptaría cualquier par", () => {
    for (const umbral of umbralesDeRelajacion("habitantes", 15)) {
      expect(umbral).toBeGreaterThan(1);
    }
  });
});
