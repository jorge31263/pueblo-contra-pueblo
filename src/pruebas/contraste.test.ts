import { describe, it, expect } from "vitest";
import { colorDeClase, contraste, hallazgosDeContraste } from "./contraste.js";

describe("colorDeClase", () => {
  it("resuelve un color de la paleta de Tailwind", () => {
    expect(colorDeClase("text-slate-500", "text")).toBe("#64748b");
    expect(colorDeClase("bg-slate-900", "bg")).toBe("#0f172a");
  });

  it("entiende el blanco y el negro, que no llevan número", () => {
    expect(colorDeClase("text-white", "text")).toBe("#ffffff");
    expect(colorDeClase("text-black", "text")).toBe("#000000");
  });

  it("ignora las clases que empiezan por text- y no son colores", () => {
    for (const clase of ["text-sm", "text-6xl", "text-center", "text-balance"]) {
      expect(colorDeClase(clase, "text")).toBeNull();
    }
  });

  it("ignora los estados, que no pintan la pantalla en reposo", () => {
    expect(colorDeClase("hover:text-slate-900", "text")).toBeNull();
  });
});

describe("contraste", () => {
  it("da 21 entre negro y blanco, el máximo de la escala", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 2);
  });

  it("da 1 entre un color y sí mismo", () => {
    expect(contraste("#64748b", "#64748b")).toBeCloseTo(1, 5);
  });

  it("mide los dos grises del caso que destapó esto", () => {
    // slate-400 sobre blanco se quedaba en 2,6:1; slate-500 llega a 4,76:1.
    expect(contraste("#94a3b8", "#ffffff")).toBeCloseTo(2.6, 1);
    expect(contraste("#64748b", "#ffffff")).toBeCloseTo(4.76, 1);
  });
});

const pintar = (html: string): Element => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
};

describe("hallazgosDeContraste", () => {
  it("delata un gris que no llega al mínimo", () => {
    const hallazgos = hallazgosDeContraste(pintar('<p class="text-slate-400">Fuentes</p>'));
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0]).toMatchObject({ texto: "Fuentes", color: "#94a3b8", razon: 2.56 });
  });

  it("acepta el mismo texto un tono más oscuro", () => {
    expect(hallazgosDeContraste(pintar('<p class="text-slate-500">Fuentes</p>'))).toEqual([]);
  });

  it("hereda el fondo del antepasado que lo pone", () => {
    // Blanco sobre blanco sería invisible; sobre el botón oscuro es correcto.
    const html = '<div class="bg-slate-900"><span class="text-white">Compartir</span></div>';
    expect(hallazgosDeContraste(pintar(html))).toEqual([]);
    expect(hallazgosDeContraste(pintar('<span class="text-white">Compartir</span>'))).toHaveLength(1);
  });

  it("no mira los contenedores, solo lo que tiene texto propio", () => {
    expect(hallazgosDeContraste(pintar('<div class="text-slate-900"><p>Hola</p></div>'))).toEqual([]);
  });

  it("deja en paz lo que está marcado como decorativo", () => {
    expect(hallazgosDeContraste(pintar('<span aria-hidden="true" class="text-slate-200">×</span>'))).toEqual([]);
  });
});
