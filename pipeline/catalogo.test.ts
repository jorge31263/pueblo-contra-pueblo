import { describe, it, expect } from "vitest";
import { construirCatalogo, type EntradaCatalogo } from "./catalogo.js";
import type { FilaNomenclator } from "./nomenclator.js";

const fila = (p: Partial<FilaNomenclator> = {}): FilaNomenclator => ({
  provincia: "Zaragoza",
  altitud: 770,
  extension: 85.72,
  ...p,
});

const entrada = (parcial: Partial<EntradaCatalogo> = {}): EntradaCatalogo => ({
  padron: new Map([["50249", 305]]),
  nombres: new Map([["50249", "Tabuenca"]]),
  nomenclator: new Map([["50249", fila()]]),
  ...parcial,
});

describe("construirCatalogo", () => {
  it("incluye un municipio completo de menos de 20.000 habitantes", () => {
    expect(construirCatalogo(entrada()).pueblos).toEqual([
      { id: "50249", nombre: "Tabuenca", provincia: "Zaragoza", habitantes: 305, altitud: 770, extension: 85.72 },
    ]);
  });

  it("descarta el municipio de 20.000 habitantes o más como demasiado-grande", () => {
    const r = construirCatalogo(entrada({ padron: new Map([["50249", 20000]]) }));
    expect(r.pueblos).toHaveLength(0);
    expect(r.descartes["demasiado-grande"]).toEqual(["50249"]);
  });

  it("acepta el municipio de 19.999 habitantes", () => {
    expect(construirCatalogo(entrada({ padron: new Map([["50249", 19999]]) })).pueblos).toHaveLength(1);
  });

  it("descarta y anota el municipio que el Nomenclátor no conoce", () => {
    const r = construirCatalogo(entrada({ nomenclator: new Map() }));
    expect(r.pueblos).toHaveLength(0);
    expect(r.descartes["sin-nomenclator"]).toEqual(["50249"]);
  });

  it("descarta y anota el municipio sin nombre", () => {
    expect(construirCatalogo(entrada({ nombres: new Map() })).descartes["sin-nombre"]).toEqual(["50249"]);
  });

  it("no revienta cuando el Nomenclátor trae un municipio que el padrón no conoce", () => {
    const r = construirCatalogo(entrada({
      nomenclator: new Map([["50249", fila()], ["99999", fila()]]),
    }));
    expect(r.pueblos.map((p) => p.id)).toEqual(["50249"]);
  });

  it("da la vuelta al artículo del nombre oficial y toma la provincia del Nomenclátor", () => {
    const r = construirCatalogo(entrada({
      padron: new Map([["15002", 1200]]),
      nombres: new Map([["15002", "Mata, La"]]),
      nomenclator: new Map([["15002", fila({ provincia: "A Coruña" })]]),
    }));
    expect(r.pueblos[0]).toMatchObject({ nombre: "La Mata", provincia: "A Coruña" });
  });

  it("ordena el catálogo por código INE", () => {
    const r = construirCatalogo(entrada({
      padron: new Map([["50249", 305], ["01001", 2955], ["33026", 9681]]),
      nombres: new Map([["50249", "Tabuenca"], ["01001", "Alegría-Dulantzi"], ["33026", "Grau/Grado"]]),
      nomenclator: new Map([["50249", fila()], ["01001", fila()], ["33026", fila()]]),
    }));
    expect(r.pueblos.map((p) => p.id)).toEqual(["01001", "33026", "50249"]);
  });
});

describe("construirCatalogo: valores imposibles", () => {
  it("descarta la extensión de cero, que delata un dato corrupto", () => {
    const r = construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ extension: 0 })]]) }));
    expect(r.descartes["valor-imposible"]).toEqual(["50249"]);
  });

  it("descarta la extensión mayor que el municipio más grande de España", () => {
    expect(construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ extension: 2500 })]]) })).pueblos).toHaveLength(0);
  });

  it("descarta la altitud fuera del rango de España", () => {
    expect(construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ altitud: 4000 })]]) })).pueblos).toHaveLength(0);
    expect(construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ altitud: -50 })]]) })).pueblos).toHaveLength(0);
  });

  it("acepta la altitud cero de los municipios costeros", () => {
    expect(construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ altitud: 0 })]]) })).pueblos).toHaveLength(1);
  });

  it("acepta la extensión diminuta de un municipio real", () => {
    expect(construirCatalogo(entrada({ nomenclator: new Map([["50249", fila({ extension: 0.02 })]]) })).pueblos).toHaveLength(1);
  });
});
