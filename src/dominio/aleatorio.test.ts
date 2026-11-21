import { describe, it, expect } from "vitest";
import { crearAleatorio, elegirUno } from "./aleatorio.js";

describe("crearAleatorio", () => {
  it("la misma semilla da la misma secuencia", () => {
    const a = crearAleatorio("2026-11-21");
    const b = crearAleatorio("2026-11-21");
    expect([a(), a(), a(), a(), a()]).toEqual([b(), b(), b(), b(), b()]);
  });

  it("semillas distintas dan secuencias distintas", () => {
    const a = crearAleatorio("2026-11-21");
    const b = crearAleatorio("2026-11-22");
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it("devuelve siempre números en [0,1)", () => {
    const r = crearAleatorio("una semilla cualquiera");
    for (let i = 0; i < 1000; i += 1) {
      const n = r();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("no se queda enganchada en un valor", () => {
    const r = crearAleatorio("x");
    expect(new Set(Array.from({ length: 50 }, () => r())).size).toBeGreaterThan(40);
  });
});

describe("elegirUno", () => {
  it("devuelve un elemento de la lista", () => {
    const r = crearAleatorio("x");
    expect(["a", "b", "c"]).toContain(elegirUno(["a", "b", "c"], r));
  });

  it("acaba eligiendo todos los elementos", () => {
    const r = crearAleatorio("x");
    const vistos = new Set(Array.from({ length: 100 }, () => elegirUno(["a", "b", "c"], r)));
    expect(vistos.size).toBe(3);
  });

  it("no acepta una lista vacía", () => {
    expect(() => elegirUno([], crearAleatorio("x"))).toThrow();
  });
});
