import { describe, it, expect } from "vitest";
import type { Pueblo } from "./tipos.js";
import { crearAleatorio } from "./aleatorio.js";
import { estanSeparados } from "./separacion.js";
import { generarRonda } from "./generador.js";
import { catalogoPrueba } from "./fixtures/catalogo-prueba.js";

const pueblo = (id: string, habitantes: number): Pueblo => ({
  id, nombre: id, provincia: "P", habitantes, altitud: habitantes, extension: habitantes,
});

describe("generarRonda", () => {
  it("devuelve un par separado para la racha que se le pide", () => {
    const r = crearAleatorio("x");
    for (let racha = 0; racha < 20; racha += 1) {
      const ronda = generarRonda(catalogoPrueba, r, racha);
      expect(estanSeparados(ronda.par[0], ronda.par[1], ronda.metrica, racha)).toBe(true);
    }
  });

  it("señala como ganador el pueblo con el valor más alto", () => {
    const r = crearAleatorio("y");
    for (let i = 0; i < 200; i += 1) {
      const { par, metrica, ganador } = generarRonda(catalogoPrueba, r, i % 18);
      const [a, b] = par;
      expect(ganador).toBe(a[metrica] > b[metrica] ? 0 : 1);
    }
  });

  it("nunca enfrenta un pueblo contra sí mismo", () => {
    const r = crearAleatorio("z");
    for (let i = 0; i < 200; i += 1) {
      const { par } = generarRonda(catalogoPrueba, r, i % 18);
      expect(par[0].id).not.toBe(par[1].id);
    }
  });

  it("es determinista para la misma semilla", () => {
    const uno = crearAleatorio("misma");
    const otro = crearAleatorio("misma");
    const a = Array.from({ length: 10 }, (_, i) => generarRonda(catalogoPrueba, uno, i));
    const b = Array.from({ length: 10 }, (_, i) => generarRonda(catalogoPrueba, otro, i));
    expect(a).toEqual(b);
  });

  it("termina aunque ningún par cumpla la separación de esa racha", () => {
    const dos = [pueblo("A", 100), pueblo("B", 101)];
    const ronda = generarRonda(dos, crearAleatorio("x"), 30);
    expect([...ronda.par].map((p) => p.id).sort()).toEqual(["A", "B"]);
  });

  it("avisa en vez de girar para siempre cuando no hay ningún par posible", () => {
    const iguales = [pueblo("A", 100), pueblo("B", 100)];
    expect(() => generarRonda(iguales, crearAleatorio("x"), 0)).toThrow(/separad/i);
  });

  it("avisa si el catálogo no tiene ni dos pueblos", () => {
    expect(() => generarRonda([pueblo("A", 1)], crearAleatorio("x"), 0)).toThrow(/dos/i);
  });

  it("evita los pueblos de la ronda anterior cuando puede", () => {
    const r = crearAleatorio("w");
    const anterior = generarRonda(catalogoPrueba, r, 0);
    const excluidos = new Set(anterior.par.map((p) => p.id));
    for (let i = 0; i < 50; i += 1) {
      const ronda = generarRonda(catalogoPrueba, r, 0, excluidos);
      expect(ronda.par.some((p) => excluidos.has(p.id))).toBe(false);
    }
  });

  it("no se bloquea si excluir deja el catálogo sin pares posibles", () => {
    const tres = [pueblo("A", 10), pueblo("B", 100), pueblo("C", 1000)];
    const ronda = generarRonda(tres, crearAleatorio("x"), 0, new Set(["A", "B", "C"]));
    expect(ronda.par[0].id).not.toBe(ronda.par[1].id);
  });

  it("usa las tres métricas a lo largo de una partida", () => {
    const r = crearAleatorio("variada");
    const vistas = new Set(Array.from({ length: 60 }, () => generarRonda(catalogoPrueba, r, 0).metrica));
    expect(vistas.size).toBe(3);
  });
});
