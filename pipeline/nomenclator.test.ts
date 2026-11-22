import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { leerNomenclator } from "./nomenclator.js";

const fixture = readFileSync(new URL("./fixtures/ngmep-min.csv", import.meta.url), "utf8");

describe("leerNomenclator", () => {
  it("usa los cinco primeros dígitos del código de once como código de municipio", () => {
    expect([...leerNomenclator(fixture).keys()]).toContain("01001");
  });

  it("recupera el cero inicial que una hoja de cálculo se come", () => {
    const csv = fixture.replace("01001000000;", "1001000000;");
    expect(leerNomenclator(csv).has("01001")).toBe(true);
    expect(leerNomenclator(csv).has("10010")).toBe(false);
  });

  it("convierte la superficie de hectáreas a km² con dos decimales", () => {
    // Madrid: 60.444,54 ha. Dos decimales porque con uno los dos municipios
    // más pequeños de España (1,26 y 2,88 ha) valdrían 0,0 km².
    expect(leerNomenclator(fixture).get("28079")?.extension).toBe(604.45);
  });

  it("entiende la coma decimal castellana", () => {
    // Tabuenca: 8.572,3098 ha. Con la coma ignorada saldría un número absurdo.
    expect(leerNomenclator(fixture).get("50249")?.extension).toBe(85.72);
  });

  it("lee la altitud en metros enteros", () => {
    expect(leerNomenclator(fixture).get("50249")?.altitud).toBe(770);
    expect(leerNomenclator(fixture).get("11004")?.altitud).toBe(17);
  });

  it("trae la provincia en su forma oficial", () => {
    expect(leerNomenclator(fixture).get("01001")?.provincia).toBe("Araba/Álava");
  });

  it("no convierte en cero el municipio más pequeño de España", () => {
    const csv = fixture.replace(";8572,3098;", ";1,26;");
    expect(leerNomenclator(csv).get("50249")?.extension).toBe(0.01);
  });

  it("incluye Canarias", () => {
    expect(leerNomenclator(fixture).get("35010")?.provincia).toBe("Las Palmas");
  });

  it("omite el municipio sin altitud o sin superficie", () => {
    const sinAltitud = fixture.replace(";Detección automática;770;MDT", ";Detección automática;;MDT");
    expect(leerNomenclator(sinAltitud).has("50249")).toBe(false);
  });

  it("avisa si el CSV no trae las columnas que espera", () => {
    expect(() => leerNomenclator("COD_INE;NOMBRE_ACTUAL\n01001000000;Alegría\n")).toThrow(/ALTITUD/);
  });
});

describe("leerNomenclator: ficheros que no son el que esperamos", () => {
  it("avisa si el mismo municipio aparece dos veces", () => {
    const dosVeces = fixture + fixture.split("\n").find((l) => l.startsWith("50249")) + "\n";
    expect(() => leerNomenclator(dosVeces)).toThrow(/50249/);
  });

  it("avisa cuando casi ninguna fila trae altitud y superficie", () => {
    // El fichero del IGN usa saltos de línea de Windows: mezclarlos hace que
    // el parser lea una sola fila y la prueba no probaría nada.
    const cabecera = fixture.split("\n")[0]!.replace(/\r$/, "");
    const columnas = cabecera.split(";").length;
    const filas = Array.from({ length: 40 }, (_, i) => {
      const celdas = Array.from({ length: columnas }, () => "");
      celdas[0] = String(10000000000 + i);
      return celdas.join(";");
    }).join("\n");
    expect(() => leerNomenclator(cabecera + "\n" + filas + "\n")).toThrow(/altitud|superficie/i);
  });
})
