import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { leerPadron } from "./padron.js";

const fixture = readFileSync(new URL("./fixtures/padron-min.csv", import.meta.url), "utf8");

describe("leerPadron", () => {
  it("conserva el cero inicial del código INE", () => {
    expect([...leerPadron(fixture).keys()]).toContain("01001");
  });

  it("lee los habitantes como entero sin separador de miles", () => {
    expect(leerPadron(fixture).get("50251")).toBe(312);
    expect(leerPadron(fixture).get("28079")).toBe(3223334);
  });

  it("ignora las filas de totales nacionales y provinciales", () => {
    expect(leerPadron(fixture).has("TOTAL")).toBe(false);
    expect(leerPadron(fixture).size).toBe(4);
  });
});
