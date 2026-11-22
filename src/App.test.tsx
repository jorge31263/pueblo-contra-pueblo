import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App.js";
import { catalogoPrueba } from "./dominio/fixtures/catalogo-prueba.js";
import { marcarRetoDiarioJugado } from "./almacenamiento.js";
import { semillaDelDia } from "./dominio/semilla.js";
import { MILISEGUNDOS_DE_REVELADO, SEGUNDOS_POR_RONDA } from "./dominio/parametros.js";

beforeEach(() => {
  localStorage.clear();
  window.location.hash = "";
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const pintar = () => {
  // Los relojes falsos tienen que seguir avanzando solos o userEvent y ellos
  // se esperan mutuamente.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<App catalogo={catalogoPrueba} />);
  return usuario;
};

/**
 * Juega eligiendo siempre la tarjeta de la izquierda hasta fallar, que es lo
 * que lleva al resumen. No se puede saber de antemano cuál pierde: los valores
 * están ocultos, que es justamente el juego.
 */
const perder = async (usuario: ReturnType<typeof userEvent.setup>) => {
  for (let ronda = 0; ronda < 40; ronda += 1) {
    await usuario.click(screen.getAllByRole("button")[0]!);
    const verResultado = screen.queryByRole("button", { name: /ver resultado/i });
    if (verResultado !== null) {
      await usuario.click(verResultado);
      return;
    }
    act(() => void vi.advanceTimersByTime(MILISEGUNDOS_DE_REVELADO + 100));
  }
  throw new Error("cuarenta rondas seguidas acertando eligiendo siempre la izquierda");
};

describe("App", () => {
  it("ofrece el reto de hoy y el modo libre al entrar", () => {
    pintar();
    expect(screen.getByRole("heading", { name: /pueblo contra pueblo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reto de hoy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /modo libre/i })).toBeInTheDocument();
  });

  it("empieza una partida al pulsar el reto de hoy", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /reto de hoy/i }));
    expect(screen.getByText(/racha 0/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /¿cuál/i })).toBeInTheDocument();
  });

  it("al terminar enseña la racha y el botón de compartir", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /reto de hoy/i }));
    await perder(usuario);
    expect(screen.getByText(/se acabó/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compartir/i })).toBeInTheDocument();
  });

  it("si el reto de hoy ya se jugó, lo dice y no deja repetirlo", () => {
    marcarRetoDiarioJugado(semillaDelDia(new Date()), 4);
    pintar();
    expect(screen.getByText(/ya has jugado/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reto de hoy/i })).not.toBeInTheDocument();
  });

  it("recuerda la mejor racha entre visitas", () => {
    marcarRetoDiarioJugado("2020-01-01", 9);
    pintar();
    expect(screen.getByText(/9/)).toBeInTheDocument();
  });

  it("el modo libre se puede jugar otra vez sin recargar", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /modo libre/i }));
    await perder(usuario);
    await usuario.click(screen.getByRole("button", { name: /otra vez/i }));
    expect(screen.getByText(/racha 0/i)).toBeInTheDocument();
  });

  it("una semilla en la URL arranca directamente el modo libre", () => {
    window.location.hash = "#libre=abc123";
    pintar();
    expect(screen.getByText(/racha 0/i)).toBeInTheDocument();
  });

  it("marca el reto diario como jugado al terminarlo", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /reto de hoy/i }));
    await perder(usuario);
    cleanup();
    pintar();
    expect(screen.getByText(/ya has jugado/i)).toBeInTheDocument();
  });
});

describe("App: el reloj solo en el reto diario", () => {
  it("el reto de hoy lleva reloj", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /reto de hoy/i }));
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });

  it("el modo libre se juega sin reloj", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /modo libre/i }));
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("agotarse el tiempo termina la partida y lo dice", async () => {
    const usuario = pintar();
    await usuario.click(screen.getByRole("button", { name: /reto de hoy/i }));
    act(() => void vi.advanceTimersByTime(SEGUNDOS_POR_RONDA * 1000 + 1000));
    expect(await screen.findByText(/se acabó/i)).toBeInTheDocument();
    expect(screen.getByText(/se te acabó el tiempo/i)).toBeInTheDocument();
  });
})
