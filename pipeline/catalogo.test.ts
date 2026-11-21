import { describe, it, expect } from "vitest";
import { construirCatalogo, type EntradaCatalogo } from "./catalogo.js";

const entrada = (parcial: Partial<EntradaCatalogo> = {}): EntradaCatalogo => ({
  padron: new Map([["50249", 305]]),
  nombres: new Map([["50249", "Tabuenca"]]),
  altitudes: new Map([["50249", 629]]),
  areas: new Map([["50249", 44.6]]),
  ...parcial,
});

describe("construirCatalogo", () => {
  it("incluye un municipio con las tres métricas y menos de 20.000 habitantes", () => {
    expect(construirCatalogo(entrada()).pueblos).toEqual([
      { id: "50249", nombre: "Tabuenca", provincia: "Zaragoza", habitantes: 305, altitud: 629, extension: 44.6 },
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

  it("descarta y anota el municipio que falta en una de las fuentes", () => {
    const r = construirCatalogo(entrada({ altitudes: new Map() }));
    expect(r.pueblos).toHaveLength(0);
    expect(r.descartes["sin-altitud"]).toEqual(["50249"]);
  });

  it("descarta el municipio sin extensión", () => {
    const r = construirCatalogo(entrada({ areas: new Map() }));
    expect(r.descartes["sin-extension"]).toEqual(["50249"]);
  });

  it("no revienta cuando una fuente trae un municipio que las otras no conocen", () => {
    const r = construirCatalogo(entrada({ areas: new Map([["50249", 44.6], ["99999", 10]]) }));
    expect(r.pueblos.map((p) => p.id)).toEqual(["50249"]);
  });

  it("normaliza el nombre y resuelve la provincia", () => {
    const r = construirCatalogo(entrada({
      padron: new Map([["15030", 247604], ["15002", 1200]]),
      nombres: new Map([["15030", "Coruña, A"], ["15002", "Ames"]]),
      altitudes: new Map([["15030", 0], ["15002", 150]]),
      areas: new Map([["15030", 37.8], ["15002", 80.0]]),
    }));
    expect(r.pueblos[0]).toMatchObject({ id: "15002", nombre: "Ames", provincia: "A Coruña" });
  });

  it("da la vuelta al artículo del nombre oficial", () => {
    const r = construirCatalogo(entrada({
      padron: new Map([["33026", 10000]]),
      nombres: new Map([["33026", "Mata, La"]]),
      altitudes: new Map([["33026", 232]]),
      areas: new Map([["33026", 220.5]]),
    }));
    expect(r.pueblos[0]?.nombre).toBe("La Mata");
  });

  it("ordena el catálogo por código INE", () => {
    const r = construirCatalogo(entrada({
      padron: new Map([["50249", 305], ["01001", 3012], ["33026", 10000]]),
      nombres: new Map([["50249", "Tabuenca"], ["01001", "Alegría-Dulantzi"], ["33026", "Grado"]]),
      altitudes: new Map([["50249", 629], ["01001", 560], ["33026", 232]]),
      areas: new Map([["50249", 44.6], ["01001", 20.1], ["33026", 220.5]]),
    }));
    expect(r.pueblos.map((p) => p.id)).toEqual(["01001", "33026", "50249"]);
  });
});

describe("construirCatalogo: valores imposibles", () => {
  it("descarta la extensión de cero, que delata un polígono degenerado", () => {
    const r = construirCatalogo(entrada({ areas: new Map([["50249", 0]]) }));
    expect(r.pueblos).toHaveLength(0);
    expect(r.descartes["valor-imposible"]).toEqual(["50249"]);
  });

  it("descarta la extensión mayor que el municipio más grande de España", () => {
    expect(construirCatalogo(entrada({ areas: new Map([["50249", 2500]]) })).pueblos).toHaveLength(0);
  });

  it("descarta la altitud fuera del rango de España", () => {
    expect(construirCatalogo(entrada({ altitudes: new Map([["50249", 4000]]) })).pueblos).toHaveLength(0);
    expect(construirCatalogo(entrada({ altitudes: new Map([["50249", -50]]) })).pueblos).toHaveLength(0);
  });

  it("acepta la altitud cero y la ligeramente negativa de los municipios costeros", () => {
    expect(construirCatalogo(entrada({ altitudes: new Map([["50249", 0]]) })).pueblos).toHaveLength(1);
    expect(construirCatalogo(entrada({ altitudes: new Map([["50249", -5]]) })).pueblos).toHaveLength(1);
  });

  it("acepta la extensión diminuta de un municipio real", () => {
    // Emperador (Valencia) ronda los 0,03 km².
    expect(construirCatalogo(entrada({ areas: new Map([["50249", 0.1]]) })).pueblos).toHaveLength(1);
  });
});
