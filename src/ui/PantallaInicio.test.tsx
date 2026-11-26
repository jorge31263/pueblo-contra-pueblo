import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PantallaInicio } from "./PantallaInicio.js";
import { informeDeContraste, MINIMO_AA } from "../pruebas/contraste.js";

afterEach(cleanup);

const pintar = (props: Partial<Parameters<typeof PantallaInicio>[0]> = {}) =>
  render(
    <PantallaInicio
      fuentes={{ generadoEl: "2026-11-21", padron: "2025-01", ngmep: "2026-10" }}
      diarioJugado={false}
      mejorDiario={4}
      mejorLibre={11}
      onJugarDiario={vi.fn()}
      onJugarLibre={vi.fn()}
      {...props}
    />,
  );

/**
 * El detector de impeccable ya mide esta pantalla al publicar, pero solo en
 * la forma con la que carga: el aviso de reto jugado y los paneles abiertos
 * no los ve, y un fallo aquí no debería esperar al despliegue para salir.
 */
describe("PantallaInicio: contraste", () => {
  it(`todo su texto llega al mínimo AA de ${MINIMO_AA}:1`, () => {
    expect(informeDeContraste(pintar().container)).toBe("");
  });

  it("también con el reto de hoy ya jugado, que cambia el botón por un aviso", () => {
    const { container } = pintar({ diarioJugado: true });
    expect(screen.getByText(/Ya has jugado el reto de hoy/)).toBeInTheDocument();
    expect(informeDeContraste(container)).toBe("");
  });

  it.each(["Cómo se juega", "De dónde salen los datos", "Aviso legal"])(
    "y con el panel de %s abierto",
    async (nombre) => {
      const usuario = userEvent.setup();
      pintar();
      await usuario.click(screen.getByRole("button", { name: nombre }));

      const panel = screen.getByRole("dialog");
      expect(panel).toHaveAccessibleName(nombre);
      expect(informeDeContraste(panel)).toBe("");
    },
  );
});
