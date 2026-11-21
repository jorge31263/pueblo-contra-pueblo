import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Pie } from "./Pie.js";

afterEach(cleanup);

describe("Pie", () => {
  it("usa la fórmula de atribución que exige la licencia del IGN", () => {
    render(<Pie />);
    // La licencia CC-BY 4.0 del NGMEP obliga a esta fórmula exacta.
    expect(screen.getByText(/Obra derivada de NGMEP CC-BY 4\.0 ign\.es/)).toBeInTheDocument();
  });

  it("nombra también al INE, que es la otra fuente", () => {
    render(<Pie />);
    expect(screen.getByText(/INE/)).toBeInTheDocument();
  });

  it("enlaza las dos fuentes", () => {
    render(<Pie />);
    expect(screen.getByRole("link", { name: /ign\.es/i })).toHaveAttribute("href", "https://www.ign.es");
    expect(screen.getByRole("link", { name: /INE/ })).toHaveAttribute("href", "https://www.ine.es");
  });
});
