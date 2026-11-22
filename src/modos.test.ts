import { describe, it, expect } from "vitest";
import { modoDesdeUrl, semillaAleatoria } from "./modos.js";

describe("modoDesdeUrl", () => {
  it("lee la semilla del modo libre del hash", () => {
    expect(modoDesdeUrl("#libre=abc123")).toEqual({ modo: "libre", semilla: "abc123" });
  });

  it("acepta el modo libre sin semilla", () => {
    expect(modoDesdeUrl("#libre")).toEqual({ modo: "libre" });
  });

  it("cae al reto diario con un hash vacío o desconocido", () => {
    expect(modoDesdeUrl("")).toEqual({ modo: "diario" });
    expect(modoDesdeUrl("#")).toEqual({ modo: "diario" });
    expect(modoDesdeUrl("#cualquiercosa")).toEqual({ modo: "diario" });
  });

  it("ignora una semilla con caracteres raros, demasiado corta o larguísima", () => {
    expect(modoDesdeUrl("#libre=; DROP TABLE")).toEqual({ modo: "diario" });
    expect(modoDesdeUrl("#libre=ab")).toEqual({ modo: "diario" });
    expect(modoDesdeUrl("#libre=" + "a".repeat(500))).toEqual({ modo: "diario" });
    expect(modoDesdeUrl("#libre=<script>")).toEqual({ modo: "diario" });
  });
});

describe("semillaAleatoria", () => {
  it("genera una semilla que modoDesdeUrl acepta", () => {
    for (let i = 0; i < 100; i += 1) {
      const semilla = semillaAleatoria();
      expect(modoDesdeUrl(`#libre=${semilla}`)).toEqual({ modo: "libre", semilla });
    }
  });

  it("no repite la misma semilla una y otra vez", () => {
    expect(new Set(Array.from({ length: 50 }, semillaAleatoria)).size).toBeGreaterThan(40);
  });
});

describe("modoDesdeUrl: el hash tal y como llega", () => {
  it("acepta el modo libre en mayúsculas", () => {
    // Algunos clientes normalizan el hash al reenviar un enlace, y el enlace
    // compartido llevaría a otra partida en silencio.
    expect(modoDesdeUrl("#LIBRE=abc123")).toEqual({ modo: "libre", semilla: "abc123" });
    expect(modoDesdeUrl("#Libre=abc123")).toEqual({ modo: "libre", semilla: "abc123" });
  });

  it("no toca la semilla, que distingue mayúsculas", () => {
    expect(modoDesdeUrl("#libre=AbC123")).toEqual({ modo: "libre", semilla: "AbC123" });
  });
});
