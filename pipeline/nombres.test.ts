import { describe, it, expect } from "vitest";
import { normalizarNombre } from "./nombres.js";

describe("normalizarNombre", () => {
  it("da la vuelta al artículo pospuesto", () => {
    expect(normalizarNombre("Coruña, A")).toBe("A Coruña");
    expect(normalizarNombre("Cabrera, La")).toBe("La Cabrera");
    expect(normalizarNombre("Palmas de Gran Canaria, Las")).toBe("Las Palmas de Gran Canaria");
  });

  it("deja intactos los nombres sin artículo pospuesto", () => {
    expect(normalizarNombre("Tabuenca")).toBe("Tabuenca");
    expect(normalizarNombre("Arrasate/Mondragón")).toBe("Arrasate/Mondragón");
  });

  it("conserva las dos formas oficiales con artículo", () => {
    expect(normalizarNombre("Vall d'Uixó, la/Vall de Uxó, la")).toBe("la Vall d'Uixó/la Vall de Uxó");
  });
});
