import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Ronda, Pueblo } from "../dominio/tipos.js";
import { PantallaRonda } from "./PantallaRonda.js";

afterEach(() => {
  cleanup();
  // Sin esto, una prueba que muere antes de restaurar los relojes deja los
  // falsos puestos y cuelga a todas las siguientes.
  vi.useRealTimers();
});

const tabuenca: Pueblo = { id: "50249", nombre: "Tabuenca", provincia: "Zaragoza", habitantes: 305, altitud: 770, extension: 85.72 };
const pedraza: Pueblo = { id: "40156", nombre: "Pedraza", provincia: "Segovia", habitantes: 335, altitud: 1066, extension: 31.58 };

const ronda: Ronda = { par: [tabuenca, pedraza], metrica: "altitud", ganador: 1 };

/**
 * userEvent espera a promesas reales, así que los relojes falsos tienen que
 * seguir avanzando solos o las dos partes se quedan esperándose.
 */
const conRelojesFalsos = () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
};

const pintar = (props: Partial<Parameters<typeof PantallaRonda>[0]> = {}) => {
  const onElegir = vi.fn();
  render(<PantallaRonda ronda={ronda} racha={3} onElegir={onElegir} {...props} />);
  return { onElegir };
};

describe("PantallaRonda", () => {
  it("anuncia la métrica de la ronda", () => {
    pintar();
    expect(screen.getByRole("heading", { name: /altitud/i })).toBeInTheDocument();
  });

  it("enseña los dos pueblos con su provincia y nada más", () => {
    pintar();
    expect(screen.getByText("Tabuenca")).toBeInTheDocument();
    expect(screen.getByText("Zaragoza")).toBeInTheDocument();
    expect(screen.getByText("Pedraza")).toBeInTheDocument();
    expect(screen.getByText("Segovia")).toBeInTheDocument();
  });

  it("enseña la racha", () => {
    pintar();
    expect(screen.getByText(/racha 3/i)).toBeInTheDocument();
  });

  it("no enseña ningún valor antes de responder", () => {
    pintar();
    expect(screen.queryByText(/770/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1066/)).not.toBeInTheDocument();
  });

  it("las dos tarjetas son botones con nombre accesible", () => {
    pintar();
    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(2);
    expect(botones[0]).toHaveAccessibleName(/Tabuenca/);
    expect(botones[1]).toHaveAccessibleName(/Pedraza/);
  });

  it("al elegir revela los valores de los dos pueblos", async () => {
    const usuario = conRelojesFalsos();
    pintar();
    await usuario.click(screen.getByRole("button", { name: /Pedraza/ }));
    // El contador sube durante el revelado, así que hay que esperar a que llegue.
    // El español no separa los millares de cuatro cifras: 1066, no 1.066.
    expect(await screen.findByText(/1066 m/)).toBeInTheDocument();
    expect(await screen.findByText(/770 m/)).toBeInTheDocument();
  });

  it("marca el acierto con texto, no solo con color", async () => {
    const usuario = userEvent.setup();
    pintar();
    await usuario.click(screen.getByRole("button", { name: /Pedraza/ }));
    expect(screen.getByText(/correcto/i)).toBeInTheDocument();
  });

  it("marca el fallo con texto y no avanza solo", async () => {
    const usuario = conRelojesFalsos();
    const { onElegir } = pintar();
    await usuario.click(screen.getByRole("button", { name: /Tabuenca/ }));
    expect(screen.getByText(/fallo/i)).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(5000));
    expect(onElegir).not.toHaveBeenCalled();
  });

  it("tras acertar avisa al padre pasado el revelado, no antes", async () => {
    const usuario = conRelojesFalsos();
    const { onElegir } = pintar();
    await usuario.click(screen.getByRole("button", { name: /Pedraza/ }));
    expect(onElegir).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1200));
    expect(onElegir).toHaveBeenCalledTimes(1);
    expect(onElegir).toHaveBeenCalledWith(1);
  });

  it("se juega con las flechas izquierda y derecha", async () => {
    const usuario = userEvent.setup();
    pintar();
    await usuario.keyboard("{ArrowRight}");
    expect(screen.getByText(/correcto/i)).toBeInTheDocument();
  });

  it("ignora la segunda pulsación durante el revelado", async () => {
    const usuario = conRelojesFalsos();
    const { onElegir } = pintar();
    await usuario.keyboard("{ArrowRight}");
    await usuario.keyboard("{ArrowLeft}");
    await usuario.click(screen.getByRole("button", { name: /Tabuenca/ }));
    act(() => void vi.advanceTimersByTime(3000));
    expect(onElegir).toHaveBeenCalledTimes(1);
    expect(onElegir).toHaveBeenCalledWith(1);
  });
});
