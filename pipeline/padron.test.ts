import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { leerPadron, leerNombres } from "./padron.js";

const fixture = readFileSync(new URL("./fixtures/padron-min.csv", import.meta.url), "utf8");

describe("leerPadron", () => {
  it("conserva el cero inicial del código INE", () => {
    expect([...leerPadron(fixture).keys()]).toContain("01001");
  });

  it("lee los habitantes como entero sin separador de miles", () => {
    expect(leerPadron(fixture).get("50249")).toBe(305);
    expect(leerPadron(fixture).get("28079")).toBe(3223334);
  });

  it("se queda con el año más reciente y no con los anteriores", () => {
    // Tabuenca tiene 305 en 2025 y 312 en 2024.
    expect(leerPadron(fixture).get("50249")).toBe(305);
  });

  it("ignora las filas de hombres y de mujeres", () => {
    // Alegría-Dulantzi: 3.012 en total, 1.520 hombres, 1.492 mujeres.
    expect(leerPadron(fixture).get("01001")).toBe(3012);
  });

  it("excluye el municipio sin fila en el año más reciente", () => {
    // Un municipio fusionado deja de publicarse y ya no existe hoy.
    expect(leerPadron(fixture).has("09999")).toBe(false);
  });

  it("no cuenta la cabecera ni se traga el BOM", () => {
    expect(leerPadron(fixture).size).toBe(4);
  });
});

describe("leerNombres", () => {
  it("saca el nombre oficial de la misma columna que el código", () => {
    expect(leerNombres(fixture).get("50249")).toBe("Tabuenca");
  });

  it("solo nombra los municipios del año más reciente", () => {
    expect(leerNombres(fixture).size).toBe(4);
    expect(leerNombres(fixture).has("09999")).toBe(false);
  });
});
