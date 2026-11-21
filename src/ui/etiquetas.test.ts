import { describe, it, expect } from "vitest";
import { etiquetaMetrica, formatearValor } from "./etiquetas.js";

describe("etiquetaMetrica", () => {
  it("pregunta por la métrica de la ronda", () => {
    expect(etiquetaMetrica("habitantes")).toBe("¿Cuál tiene más habitantes?");
    expect(etiquetaMetrica("altitud")).toBe("¿Cuál está a más altitud?");
    expect(etiquetaMetrica("extension")).toBe("¿Cuál tiene más extensión?");
  });
});

describe("formatearValor", () => {
  it("escribe los habitantes como en español", () => {
    // El español no separa los millares de cuatro cifras.
    expect(formatearValor(1066, "habitantes")).toBe("1066 habitantes");
    expect(formatearValor(12891, "habitantes")).toBe("12.891 habitantes");
    expect(formatearValor(1, "habitantes")).toBe("1 habitante");
  });

  it("escribe la altitud en metros", () => {
    expect(formatearValor(770, "altitud")).toBe("770 m");
    expect(formatearValor(0, "altitud")).toBe("0 m");
  });

  it("escribe la extensión en km² con coma decimal", () => {
    expect(formatearValor(85.72, "extension")).toBe("85,72 km²");
    expect(formatearValor(0.01, "extension")).toBe("0,01 km²");
    expect(formatearValor(1207.9, "extension")).toBe("1207,9 km²");
  });
});
