import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  leerMejorRacha,
  guardarMejorRacha,
  retoDiarioJugado,
  marcarRetoDiarioJugado,
} from "./almacenamiento.js";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("mejor racha", () => {
  it("empieza en cero", () => {
    expect(leerMejorRacha("diario")).toBe(0);
    expect(leerMejorRacha("libre")).toBe(0);
  });

  it("recuerda la mejor racha de cada modo por separado", () => {
    guardarMejorRacha("diario", 7);
    guardarMejorRacha("libre", 3);
    expect(leerMejorRacha("diario")).toBe(7);
    expect(leerMejorRacha("libre")).toBe(3);
  });

  it("no baja la mejor racha con un resultado peor", () => {
    guardarMejorRacha("diario", 7);
    guardarMejorRacha("diario", 2);
    expect(leerMejorRacha("diario")).toBe(7);
  });

  it("sobrevive a un valor corrupto guardado por otra versión", () => {
    localStorage.setItem("pcp.mejorRacha.diario", "{{{");
    expect(leerMejorRacha("diario")).toBe(0);
  });
});

describe("reto diario", () => {
  it("sabe si el de hoy ya se jugó y no confunde días", () => {
    expect(retoDiarioJugado("2026-11-21")).toBe(false);
    marcarRetoDiarioJugado("2026-11-21", 5);
    expect(retoDiarioJugado("2026-11-21")).toBe(true);
    expect(retoDiarioJugado("2026-11-22")).toBe(false);
  });

  it("al marcarlo guarda también la mejor racha", () => {
    marcarRetoDiarioJugado("2026-11-21", 5);
    expect(leerMejorRacha("diario")).toBe(5);
  });
});

describe("cuando el navegador no deja guardar", () => {
  it("no revienta al escribir con el almacenamiento bloqueado", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => guardarMejorRacha("diario", 5)).not.toThrow();
    expect(() => marcarRetoDiarioJugado("2026-11-21", 5)).not.toThrow();
  });

  it("no revienta al leer con el almacenamiento bloqueado", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(leerMejorRacha("diario")).toBe(0);
    expect(retoDiarioJugado("2026-11-21")).toBe(false);
  });
});

describe("rachas imposibles", () => {
  it("ignora una racha manipulada a mano en el navegador", () => {
    localStorage.setItem("pcp.mejorRacha.diario", "1e21");
    expect(leerMejorRacha("diario")).toBe(0);
  });

  it("ignora una racha negativa o absurda", () => {
    localStorage.setItem("pcp.mejorRacha.libre", "-5");
    expect(leerMejorRacha("libre")).toBe(0);
    localStorage.setItem("pcp.mejorRacha.libre", "999999");
    expect(leerMejorRacha("libre")).toBe(0);
  });

  it("acepta una racha alta pero posible", () => {
    guardarMejorRacha("libre", 250);
    expect(leerMejorRacha("libre")).toBe(250);
  });
});
