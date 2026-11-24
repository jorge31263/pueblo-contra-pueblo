import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComoSeJuega } from "./ComoSeJuega.js";
import {
  PARAMETROS,
  RACHA_MAS_DIFICIL,
  SEGUNDOS_POR_RONDA,
} from "../dominio/parametros.js";

afterEach(cleanup);

const abrir = async () => {
  const usuario = userEvent.setup();
  render(<ComoSeJuega />);
  await usuario.click(screen.getByRole("button", { name: /cómo se juega/i }));
  return usuario;
};

describe("ComoSeJuega", () => {
  it("no estorba: hasta que no se piden, las reglas no están", () => {
    render(<ComoSeJuega />);
    expect(screen.getByRole("button", { name: /cómo se juega/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre las reglas al pulsar", async () => {
    await abrir();
    expect(screen.getByRole("dialog", { name: /cómo se juega/i })).toBeInTheDocument();
  });

  it("explica las tres métricas y que se acaba al primer fallo", async () => {
    await abrir();
    const texto = screen.getByRole("dialog").textContent ?? "";
    expect(texto).toMatch(/habitantes/i);
    expect(texto).toMatch(/altitud/i);
    expect(texto).toMatch(/extensión|superficie|ocupa/i);
    expect(texto).toMatch(/fall/i);
  });

  /**
   * Unas reglas que no concuerdan con el juego son peores que no tenerlas: el
   * jugador cuenta con un margen que no es el que aplica el generador. Por eso
   * el texto sale de los parámetros y estos tests lo comprueban.
   */
  it("el tiempo que anuncia es el que mide el juego, y dice dónde corre", async () => {
    await abrir();
    const texto = screen.getByRole("dialog").textContent ?? "";
    expect(texto).toContain(`${SEGUNDOS_POR_RONDA} segundos`);
    expect(texto).toMatch(/reto de (cada día|hoy)|reto diario/i);
    expect(texto).toMatch(/modo libre/i);
  });

  it("la exigencia que explica es la que aplica el generador", async () => {
    await abrir();
    const texto = screen.getByRole("dialog").textContent ?? "";
    const veces = PARAMETROS.habitantes.alPrincipio.toLocaleString("es-ES");
    const margen = Math.round((PARAMETROS.habitantes.alFinal - 1) * 100);
    expect(texto).toContain(`${veces} veces`);
    expect(texto).toContain(`${margen}%`);
    expect(texto).toContain(`ronda ${RACHA_MAS_DIFICIL}`);
  });

  it("al abrirse el foco entra en el panel", async () => {
    await abrir();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("se cierra con Escape", async () => {
    const usuario = await abrir();
    await usuario.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("se cierra con el botón de cerrar y el foco vuelve a donde estaba", async () => {
    const usuario = await abrir();
    await usuario.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cómo se juega/i })).toHaveFocus();
  });
  /**
   * Un panel que dice aria-modal y deja que el tabulador se vaya al juego de
   * detrás miente al lector de pantalla: anuncia que no hay nada más y hay
   * dos botones de jugar esperando.
   */
  it("el tabulador no se escapa del panel", async () => {
    const usuario = await abrir();
    await usuario.tab();
    expect(screen.getByRole("button", { name: /cerrar/i })).toHaveFocus();
    await usuario.tab();
    expect(screen.getByRole("button", { name: /cerrar/i })).toHaveFocus();
    await usuario.tab({ shift: true });
    expect(screen.getByRole("button", { name: /cerrar/i })).toHaveFocus();
  });
});
