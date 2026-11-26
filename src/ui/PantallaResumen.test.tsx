import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Ronda, Pueblo } from "../dominio/tipos.js";
import { PantallaResumen } from "./PantallaResumen.js";
import { fallosDeContraste, MINIMO_AA } from "../pruebas/contraste.js";

afterEach(cleanup);

const tabuenca: Pueblo = { id: "50249", nombre: "Tabuenca", provincia: "Zaragoza", habitantes: 305, altitud: 770, extension: 85.72 };
const pedraza: Pueblo = { id: "40156", nombre: "Pedraza", provincia: "Segovia", habitantes: 335, altitud: 1066, extension: 31.58 };
const ronda: Ronda = { par: [tabuenca, pedraza], metrica: "altitud", ganador: 1 };

const pintar = (props: Partial<Parameters<typeof PantallaResumen>[0]> = {}) =>
  render(
    <PantallaResumen
      fuentes={{ generadoEl: "2026-11-21", padron: "2025-01", ngmep: "2026-10" }}
      racha={7}
      mejor={9}
      modo="diario"
      semilla="20261126"
      url="https://ejemplo.es/"
      ronda={ronda}
      porTiempo={false}
      onOtraVez={vi.fn()}
      onInicio={vi.fn()}
      {...props}
    />,
  );

const comoTexto = (fallos: ReturnType<typeof fallosDeContraste>) =>
  fallos.map((f) => `"${f.texto}" ${f.color} sobre ${f.fondo} da ${f.razon}:1`).join("\n");

/**
 * El detector de impeccable, que es quien vigila esto en la publicación,
 * carga URLs y al resumen solo se llega jugando. Así que esta pantalla se
 * mide aquí o no se mide en ninguna parte.
 */
describe("PantallaResumen: contraste", () => {
  it(`todo su texto llega al mínimo AA de ${MINIMO_AA}:1`, () => {
    const { container } = pintar();
    const fallos = fallosDeContraste(container);
    expect(comoTexto(fallos)).toBe("");
  });

  it("también cuando la partida se acabó por tiempo", () => {
    const { container } = pintar({ porTiempo: true });
    expect(comoTexto(fallosDeContraste(container))).toBe("");
  });

  it("también en modo libre, que añade el botón de otra vez", () => {
    const { container } = pintar({ modo: "libre" });
    expect(comoTexto(fallosDeContraste(container))).toBe("");
  });

  it.each(["Cómo se juega", "De dónde salen los datos", "Aviso legal"])(
    "y con el panel de %s abierto, que es donde está la letra pequeña",
    async (nombre) => {
      const usuario = userEvent.setup();
      pintar();
      await usuario.click(screen.getByRole("button", { name: nombre }));

      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAccessibleName(nombre);
      expect(comoTexto(fallosDeContraste(panel))).toBe("");
    },
  );
});
