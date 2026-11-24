import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeDondeSalenLosDatos } from "./DeDondeSalenLosDatos.js";
import type { Fuentes } from "../catalogo.js";

afterEach(cleanup);

const FUENTES: Fuentes = { generadoEl: "2026-11-22", padron: "2025", ngmep: "2026-03" };

const abrir = async (fuentes: Fuentes = FUENTES) => {
  const usuario = userEvent.setup();
  render(<DeDondeSalenLosDatos fuentes={fuentes} />);
  await usuario.click(screen.getByRole("button", { name: /datos/i }));
  return screen.getByRole("dialog").textContent ?? "";
};

describe("DeDondeSalenLosDatos", () => {
  it("nombra las tres fuentes y qué saca de cada una", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/INE/);
    expect(texto).toMatch(/Nomenclátor/i);
    expect(texto).toMatch(/habitantes/i);
    expect(texto).toMatch(/altitud/i);
  });

  it("dice de cuándo son las cifras, con lo que trae el snapshot", async () => {
    const texto = await abrir();
    expect(texto).toContain("2025");
    expect(texto).toContain("marzo de 2026");
    expect(texto).toContain("22 de noviembre de 2026");
  });

  /**
   * Una fecha inventada sería peor que ninguna: el que lee se fía de ella. Si
   * el snapshot no la trae, o la trae rota, no se enseña.
   */
  it("sin fechas, o con una rota, no se inventa ninguna", async () => {
    const texto = await abrir({ generadoEl: "cualquier cosa" });
    expect(texto).not.toMatch(/undefined|Invalid|NaN/);
  });

  it("avisa de que las cifras son de una fecha y pueden tener fallos", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/error|fallo|equivocad/i);
  });

  it("enlaza a donde se puede avisar de un error", async () => {
    await abrir();
    const aviso = screen.getByRole("link", { name: /avisar|cuéntam|error/i });
    expect(aviso).toHaveAttribute("href", expect.stringContaining("/issues"));
    // Abrir el repositorio no debe tirar la partida que haya empezada.
    expect(aviso).toHaveAttribute("target", "_blank");
    expect(aviso).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
