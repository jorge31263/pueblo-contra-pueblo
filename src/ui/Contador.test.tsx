import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Contador } from "./Contador.js";

afterEach(cleanup);

describe("Contador", () => {
  it("nunca enseña medio habitante mientras sube", () => {
    render(<Contador valor={12891} metrica="habitantes" />);
    expect(screen.getByText(/habitantes?$/)).not.toHaveTextContent(",");
  });

  it("nunca enseña medio metro mientras sube", () => {
    render(<Contador valor={1066} metrica="altitud" />);
    expect(screen.getByText(/m$/)).not.toHaveTextContent(",");
  });

  it("no empieza en cero cuando el valor es diminuto", () => {
    // Llocnou de la Corona son 0,01 km²: contar hasta ahí es enseñar un cero falso.
    render(<Contador valor={0.01} metrica="extension" />);
    expect(screen.getByText(/km²$/)).toHaveTextContent("0,01 km²");
  });
});

describe("Contador: el arranque", () => {
  it("no enseña cero en el primer fotograma de un valor que no es cero", () => {
    render(<Contador valor={1066} metrica="altitud" />);
    expect(screen.getByText(/m$/)).not.toHaveTextContent(/^0 m$/);
  });

  it("enseña cero si el valor es cero", () => {
    render(<Contador valor={0} metrica="altitud" />);
    expect(screen.getByText(/m$/)).toHaveTextContent("0 m");
  });
});
