import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AvisoLegal } from "./AvisoLegal.js";

afterEach(cleanup);

const abrir = async () => {
  const usuario = userEvent.setup();
  render(<AvisoLegal />);
  await usuario.click(screen.getByRole("button", { name: /aviso legal/i }));
  return screen.getByRole("dialog").textContent ?? "";
};

describe("AvisoLegal", () => {
  it("dice que no hay publicidad, venta ni ánimo de lucro", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/publicidad/i);
    expect(texto).toMatch(/no vende|no se vende/i);
    expect(texto).toMatch(/ánimo de lucro/i);
  });

  it("enumera lo que se guarda y dice que no sale del navegador", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/mejor racha/i);
    expect(texto).toMatch(/reto de hoy/i);
    expect(texto).toMatch(/no salen? de tu|no se env/i);
  });

  it("dice que no usa cookies", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/cookies/i);
  });

  /**
   * Lo que no controlamos hay que decirlo igual: el servidor que sirve la web
   * registra las peticiones aunque el juego no mande nada.
   */
  it("avisa de que el alojamiento registra las peticiones", async () => {
    const texto = await abrir();
    expect(texto).toMatch(/GitHub Pages/i);
    expect(texto).toMatch(/IP/);
    const politica = screen.getByRole("link", { name: /política|privacidad/i });
    expect(politica).toHaveAttribute("href", expect.stringContaining("github.com"));
  });

  it("no deja huecos sin rellenar a la vista", async () => {
    const texto = await abrir();
    expect(texto).not.toMatch(/undefined|\[|TODO|XXX/);
  });

  it("dice dónde escribir", async () => {
    await abrir();
    expect(screen.getByRole("link", { name: /issues|escrib|cuéntam/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/issues"),
    );
  });
});

/**
 * El aviso afirma que la web no pide nada a terceros. Si alguien mete una
 * fuente de Google o una analítica, el aviso pasa a ser mentira sin que nadie
 * lo note: esto lo convierte en un test rojo.
 */
describe("la promesa de no llamar a terceros", () => {
  it("ni el HTML ni los estilos cargan nada de fuera", () => {
    const leer = (ruta: string) => readFileSync(resolve(process.cwd(), ruta), "utf8");
    const html = leer("index.html");
    const css = leer("src/estilos.css");
    const externos = /(?:src|href)\s*=\s*["']https?:\/\/|@import\s+(?:url\()?["']?https?:\/\//gi;
    expect(html.match(externos)).toBeNull();
    expect(css.match(externos)).toBeNull();
  });
});
