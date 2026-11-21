import { describe, it, expect } from "vitest";
import { catalogoPrueba } from "./catalogo-prueba.js";

describe("catalogoPrueba", () => {
  it("cubre el rango de las tres métricas", () => {
    expect(catalogoPrueba).toHaveLength(40);
    expect(Math.min(...catalogoPrueba.map((p) => p.altitud))).toBeLessThan(10);
    expect(Math.max(...catalogoPrueba.map((p) => p.altitud))).toBeGreaterThan(1200);
    expect(Math.min(...catalogoPrueba.map((p) => p.extension))).toBeLessThan(1);
    expect(Math.max(...catalogoPrueba.map((p) => p.extension))).toBeGreaterThan(100);
  });

  it("son pueblos: todos por debajo de 20.000 habitantes", () => {
    expect(catalogoPrueba.every((p) => p.habitantes < 20000)).toBe(true);
    expect(catalogoPrueba.every((p) => p.habitantes > 0)).toBe(true);
  });

  it("no repite ningún pueblo", () => {
    expect(new Set(catalogoPrueba.map((p) => p.id)).size).toBe(40);
  });

  it("todos traen nombre y provincia", () => {
    expect(catalogoPrueba.every((p) => p.nombre.length > 0 && p.provincia.length > 0)).toBe(true);
  });
});
