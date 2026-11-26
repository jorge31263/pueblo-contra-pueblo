import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Ronda, Pueblo } from "../dominio/tipos.js";
import { PantallaRonda } from "./PantallaRonda.js";
import { MILISEGUNDOS_DE_REVELADO, SEGUNDOS_POR_RONDA, SEGUNDOS_DE_AVISO } from "../dominio/parametros.js";
import { informeDeContraste, MINIMO_AA } from "../pruebas/contraste.js";

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
    act(() => void vi.advanceTimersByTime(MILISEGUNDOS_DE_REVELADO));
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

describe("PantallaRonda: la pista de cómo se juega", () => {
  it("no da por hecho que hay ratón ni teclado", () => {
    pintar();
    // En un móvil no hay ni ratón ni flechas, y el reto diario se juega sobre
    // todo ahí.
    const pista = screen.getByText(/toca|pulsa/i);
    expect(pista).toBeInTheDocument();
    expect(pista.textContent).not.toMatch(/ratón/i);
  });
});

describe("PantallaRonda: accesibilidad", () => {
  it("anuncia la ronda nueva en una región viva, con métrica y pueblos", () => {
    pintar();
    const vivas = [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent ?? "");
    const anuncio = vivas.join(" | ");
    expect(anuncio).toMatch(/altitud/i);
    expect(anuncio).toMatch(/Tabuenca/);
    expect(anuncio).toMatch(/Pedraza/);
  });

  it("el nombre accesible del botón incluye el valor una vez revelado", async () => {
    const usuario = userEvent.setup();
    pintar();
    await usuario.click(screen.getByRole("button", { name: /Pedraza/ }));
    // El contador tarda medio revelado en llegar a su cifra.
    expect(
      await screen.findByRole("button", { name: /1066 m/ }, { timeout: MILISEGUNDOS_DE_REVELADO }),
    ).toBeInTheDocument();
  });

  it("no pierde el foco al revelar", async () => {
    const usuario = userEvent.setup();
    pintar();
    const boton = screen.getByRole("button", { name: /Pedraza/ });
    boton.focus();
    await usuario.click(boton);
    expect(document.activeElement).toBe(boton);
  });

  it("las flechas no hacen scroll de la página", () => {
    pintar();
    const evento = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true, bubbles: true });
    window.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });

  it("dos teclas en el mismo tick no convierten un acierto en un fallo", () => {
    pintar();
    // Las dos en el mismo act: es el caso en que React todavía no ha retirado
    // el listener anterior cuando llega la segunda tecla.
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    });
    expect(screen.getByText(/correcto/i)).toBeInTheDocument();
    expect(screen.queryByText(/fallo/i)).not.toBeInTheDocument();
  });
});

describe("PantallaRonda: el reloj", () => {
  const pintarConReloj = () => {
    const usuario = conRelojesFalsos();
    const onElegir = vi.fn();
    const onAgotado = vi.fn();
    render(
      <PantallaRonda
        ronda={ronda}
        racha={3}
        segundos={SEGUNDOS_POR_RONDA}
        onElegir={onElegir}
        onAgotado={onAgotado}
      />,
    );
    return { usuario, onElegir, onAgotado };
  };

  it("sin la prop no hay reloj: el modo libre se juega sin agobio", () => {
    pintar();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("enseña el tiempo que queda y lo va bajando", () => {
    pintarConReloj();
    expect(screen.getByRole("timer")).toHaveTextContent(String(SEGUNDOS_POR_RONDA));
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByRole("timer")).toHaveTextContent(String(SEGUNDOS_POR_RONDA - 3));
  });

  it("al agotarse avisa una sola vez", () => {
    const { onAgotado } = pintarConReloj();
    act(() => void vi.advanceTimersByTime(SEGUNDOS_POR_RONDA * 1000 + 2000));
    expect(onAgotado).toHaveBeenCalledTimes(1);
  });

  it("el reloj se para durante el revelado", async () => {
    const { usuario, onAgotado } = pintarConReloj();
    await usuario.click(screen.getByRole("button", { name: /Pedraza/ }));
    act(() => void vi.advanceTimersByTime(SEGUNDOS_POR_RONDA * 1000 + 5000));
    expect(onAgotado).not.toHaveBeenCalled();
  });

  it("avisa cuando quedan pocos segundos, también a un lector de pantalla", () => {
    pintarConReloj();
    act(() => void vi.advanceTimersByTime((SEGUNDOS_POR_RONDA - SEGUNDOS_DE_AVISO) * 1000));
    const vivas = [...document.querySelectorAll("[aria-live]")].map((n) => n.textContent ?? "").join(" ");
    expect(vivas).toMatch(/quedan 5 segundos/i);
  });
});

describe("PantallaRonda: estructura de la página", () => {
  it("la pregunta es el encabezado de primer nivel", () => {
    pintar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/altitud/i);
  });

  it("el contenido va dentro de main", () => {
    pintar();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("PantallaRonda: dejar la partida", () => {
  it("sin salida ofrecida no se pinta ninguna", () => {
    pintar();
    expect(screen.queryByRole("button", { name: /dejar la partida/i })).not.toBeInTheDocument();
  });

  it("pulsar la salida avisa al padre", async () => {
    const usuario = userEvent.setup();
    const onDejarlo = vi.fn();
    pintar({ onDejarlo });
    await usuario.click(screen.getByRole("button", { name: /dejar la partida/i }));
    expect(onDejarlo).toHaveBeenCalledOnce();
  });

  /**
   * Instalado en el móvil no hay barra de navegador ni botón de atrás: sin
   * esta salida, la única forma de salir de una ronda es responder.
   */
  it("la salida no se cuela en el orden de tabulación antes que los pueblos", () => {
    pintar({ onDejarlo: vi.fn() });
    const botones = screen.getAllByRole("button");
    expect(botones[0]).toHaveTextContent(/tabuenca/i);
  });
});

/**
 * El detector de impeccable mide esta pantalla al publicar, pero solo como la
 * encuentra al cargar: con los valores ocultos y el reloj entero. Revelar o
 * dejar que baje el tiempo cambia los colores, y a eso no llega.
 */
describe("PantallaRonda: contraste", () => {
  it(`con los valores ocultos llega al mínimo AA de ${MINIMO_AA}:1`, () => {
    const { container } = render(<PantallaRonda ronda={ronda} racha={3} onElegir={vi.fn()} />);
    expect(informeDeContraste(container)).toBe("");
  });

  it("y con la salida a mitad de partida ofrecida", () => {
    const { container } = render(
      <PantallaRonda ronda={ronda} racha={3} onElegir={vi.fn()} onDejarlo={vi.fn()} />,
    );
    expect(informeDeContraste(container)).toBe("");
  });

  it("y una vez revelados los dos valores, que pinta de verde al ganador", async () => {
    const usuario = conRelojesFalsos();
    const { container } = render(<PantallaRonda ronda={ronda} racha={3} onElegir={vi.fn()} />);
    await usuario.click(screen.getByRole("button", { name: /tabuenca/i }));
    act(() => void vi.advanceTimersByTime(MILISEGUNDOS_DE_REVELADO));

    expect(screen.getByText(/tu elección/i)).toBeInTheDocument();
    expect(informeDeContraste(container)).toBe("");
  });

  it("y con el reloj en rojo, que es cuando el aviso tiene que leerse", () => {
    vi.useFakeTimers();
    const { container } = render(
      <PantallaRonda ronda={ronda} racha={3} onElegir={vi.fn()} segundos={SEGUNDOS_POR_RONDA} />,
    );
    act(() => void vi.advanceTimersByTime((SEGUNDOS_POR_RONDA - SEGUNDOS_DE_AVISO) * 1000));

    expect(screen.getByLabelText(`Quedan ${SEGUNDOS_DE_AVISO} segundos`)).toBeInTheDocument();
    expect(informeDeContraste(container)).toBe("");
  });
});
