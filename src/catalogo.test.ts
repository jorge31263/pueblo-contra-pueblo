import { describe, it, expect } from "vitest";
import { cargarCatalogo } from "./catalogo.js";

const catalogo = cargarCatalogo();

describe("cargarCatalogo", () => {
  it("trae todos los pueblos del snapshot", () => {
    expect(catalogo.length).toBeGreaterThan(1000);
  });

  it("todos son pueblos: menos de 20.000 habitantes y al menos uno", () => {
    expect(catalogo.every((p) => p.habitantes > 0 && p.habitantes < 20000)).toBe(true);
  });

  it("todos traen las tres métricas en rangos posibles", () => {
    expect(catalogo.every((p) => p.altitud >= -10 && p.altitud <= 2100)).toBe(true);
    expect(catalogo.every((p) => p.extension > 0 && p.extension <= 1800)).toBe(true);
  });

  it("todos traen nombre y provincia", () => {
    expect(catalogo.every((p) => p.nombre.length > 0 && p.provincia.length > 0)).toBe(true);
  });

  it("ningún nombre conserva el artículo pospuesto del INE", () => {
    expect(catalogo.filter((p) => /,\s*(a|la|el|o|les|els|sa|ses|las|los|as|os)$/i.test(p.nombre)))
      .toEqual([]);
  });

  it("no hay ids repetidos", () => {
    expect(new Set(catalogo.map((p) => p.id)).size).toBe(catalogo.length);
  });

  it("todos los ids son códigos INE de cinco dígitos", () => {
    expect(catalogo.every((p) => /^\d{5}$/.test(p.id))).toBe(true);
  });
});
