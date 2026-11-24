import { describe, it, expect } from "vitest";
import { validarCatalogo, leerFuentes } from "./catalogo.js";
import snapshot from "../public/snapshot.json";

const catalogo = validarCatalogo(snapshot);

describe("el snapshot real", () => {
  it("trae todos los pueblos", () => {
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

  it("no hay ids repetidos, y todos son códigos INE de cinco dígitos", () => {
    expect(new Set(catalogo.map((p) => p.id)).size).toBe(catalogo.length);
    expect(catalogo.every((p) => /^\d{5}$/.test(p.id))).toBe(true);
  });
});

describe("validarCatalogo", () => {
  it("rechaza un snapshot vacío o truncado", () => {
    expect(() => validarCatalogo({ pueblos: [] })).toThrow(/0 pueblos/);
    expect(() => validarCatalogo({})).toThrow(/0 pueblos/);
    expect(() => validarCatalogo(null)).toThrow(/0 pueblos/);
  });

  it("rechaza un pueblo al que le falta una métrica", () => {
    const pueblos = Array.from({ length: 1200 }, (_, i) => ({
      id: String(i).padStart(5, "0"), nombre: "X", provincia: "Y",
      habitantes: 100, altitud: 100, extension: 10,
    }));
    pueblos[7] = { ...pueblos[7]!, altitud: undefined as unknown as number };
    expect(() => validarCatalogo({ pueblos })).toThrow(/no tienen la forma esperada/);
  });
});

describe("leerFuentes", () => {
  it("saca del snapshot real la fecha y las dos ediciones", () => {
    const fuentes = leerFuentes(snapshot);
    expect(fuentes.generadoEl).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(fuentes.padron).toMatch(/^\d{4}$/);
    expect(fuentes.ngmep).toMatch(/^\d{4}-\d{2}$/);
  });

  /**
   * La procedencia es información, no requisito: un snapshot sin ella se puede
   * jugar igual. Reventar aquí dejaría el juego en la pantalla de error por un
   * dato que no hace falta para jugar.
   */
  it("un snapshot sin metadatos no rompe nada", () => {
    expect(leerFuentes({ pueblos: [] })).toEqual({});
    expect(leerFuentes(null)).toEqual({});
    expect(leerFuentes({ generadoEl: 7, fuentes: { padron: "" } })).toEqual({});
  });
});
