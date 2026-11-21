import { describe, it, expect } from "vitest";
import { textoCompartir } from "./compartir.js";

const base = { racha: 14, semilla: "2026-11-21", modo: "diario" as const, url: "https://x.es" };

describe("textoCompartir", () => {
  it("da el formato del spec para el reto diario", () => {
    expect(textoCompartir(base)).toBe(
      "Pueblo contra pueblo · 21 nov\nRacha 14 🟩×14 🟥\n¿Me ganas? https://x.es",
    );
  });

  it("no menciona ningún pueblo ni ninguna métrica", () => {
    expect(textoCompartir(base)).not.toMatch(/habitantes|altitud|extensi/i);
  });

  it("enlaza la semilla en el modo libre para jugar la misma secuencia", () => {
    const texto = textoCompartir({ ...base, modo: "libre", semilla: "abc123" });
    expect(texto).toContain("https://x.es#libre=abc123");
    expect(texto).not.toContain("21 nov");
  });

  it("aguanta la racha 0 sin cuadrícula vacía", () => {
    const texto = textoCompartir({ ...base, racha: 0 });
    expect(texto).toContain("Racha 0 🟥");
    expect(texto).not.toContain("×0");
  });

  it("escribe un solo cuadrado verde sin multiplicador", () => {
    expect(textoCompartir({ ...base, racha: 1 })).toContain("Racha 1 🟩 🟥");
  });
});
