import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { leerAltitudes } from "./altitudes.js";

const fixture = readFileSync(new URL("./fixtures/ngmep-min.csv", import.meta.url), "utf8");

describe("leerAltitudes", () => {
  it("toma la altitud del núcleo capital del municipio", () => {
    expect(leerAltitudes(fixture).get("50249")).toBe(629);
  });

  it("acepta la altitud cero", () => {
    expect(leerAltitudes(fixture).get("11004")).toBe(0);
  });

  it("omite el municipio cuando la altitud está vacía", () => {
    expect(leerAltitudes(fixture).has("07001")).toBe(false);
  });

  it("ignora los núcleos que no son la capital", () => {
    expect(leerAltitudes(fixture).get("33026")).toBe(232);
  });
});

describe("leerAltitudes: códigos maltratados por una hoja de cálculo", () => {
  it("recupera el cero inicial que Excel se come", () => {
    // El código de entidad son diez dígitos: 07001 (Alaró) + 01001 (su capital).
    // Abierto como número queda en nueve y el municipio pasaría a ser "70010".
    const csv = "CODIGO_INE;NOMBRE;TIPO;ALTITUD\n700101001;Alaró;CAPITAL;240\n";
    expect(leerAltitudes(csv).get("07001")).toBe(240);
    expect(leerAltitudes(csv).has("70010")).toBe(false);
  });
});
