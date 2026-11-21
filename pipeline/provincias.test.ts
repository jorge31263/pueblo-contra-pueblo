import { describe, it, expect } from "vitest";
import { provinciaDe } from "./provincias.js";

describe("provinciaDe", () => {
  it("resuelve la provincia por los dos primeros dígitos", () => {
    expect(provinciaDe("01001")).toBe("Álava");
    expect(provinciaDe("50251")).toBe("Zaragoza");
    expect(provinciaDe("38023")).toBe("Santa Cruz de Tenerife");
  });

  it("rechaza un id que no sean cinco dígitos", () => {
    expect(() => provinciaDe("1001")).toThrow();
  });
});
