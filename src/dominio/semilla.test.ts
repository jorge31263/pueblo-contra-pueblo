import { describe, it, expect } from "vitest";
import { semillaDelDia, fechaLegible } from "./semilla.js";

const horasEntre = (desde: string, hasta: string): Date[] => {
  const fechas: Date[] = [];
  for (let t = Date.parse(desde); t <= Date.parse(hasta); t += 3600_000) fechas.push(new Date(t));
  return fechas;
};

const diasDistintos = (desde: string, hasta: string): string[] => [
  ...new Set(horasEntre(desde, hasta).map(semillaDelDia)),
];

describe("semillaDelDia", () => {
  it("usa la hora peninsular, no la del navegador", () => {
    // 23:30 UTC del 21 son las 00:30 del 22 en Madrid.
    expect(semillaDelDia(new Date("2026-11-21T23:30:00Z"))).toBe("2026-11-22");
    expect(semillaDelDia(new Date("2026-11-21T22:30:00Z"))).toBe("2026-11-21");
  });

  it("no repite ni se salta un día en el cambio de hora de octubre", () => {
    // El 25 de octubre de 2026 se atrasa el reloj: ese día tiene 25 horas.
    expect(diasDistintos("2026-10-24T00:00:00Z", "2026-10-26T22:00:00Z"))
      .toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
  });

  it("no repite ni se salta un día en el cambio de hora de marzo", () => {
    // El 29 de marzo de 2026 se adelanta el reloj: ese día tiene 23 horas.
    expect(diasDistintos("2026-03-28T00:00:00Z", "2026-03-30T21:00:00Z"))
      .toEqual(["2026-03-28", "2026-03-29", "2026-03-30"]);
  });

  it("avanza un día exactamente a medianoche peninsular", () => {
    expect(semillaDelDia(new Date("2026-06-30T21:59:00Z"))).toBe("2026-06-30");
    expect(semillaDelDia(new Date("2026-06-30T22:00:00Z"))).toBe("2026-07-01");
  });
});

describe("fechaLegible", () => {
  it("escribe la fecha como la diría una persona", () => {
    expect(fechaLegible("2026-11-21")).toBe("21 nov");
    expect(fechaLegible("2026-01-05")).toBe("5 ene");
    expect(fechaLegible("2026-09-30")).toBe("30 sep");
  });
});
