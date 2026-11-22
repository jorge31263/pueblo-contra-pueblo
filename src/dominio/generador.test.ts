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
    expect(() => generarRonda(iguales, crearAleatorio("x"), 0)).toThrow(/valores distintos/i);
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

describe("generarRonda: métricas sin pares posibles", () => {
  const conAltitudesIguales: Pueblo[] = [
    { id: "A", nombre: "A", provincia: "P", habitantes: 100, altitud: 500, extension: 10 },
    { id: "B", nombre: "B", provincia: "P", habitantes: 1000, altitud: 500, extension: 100 },
    { id: "C", nombre: "C", provincia: "P", habitantes: 5000, altitud: 500, extension: 500 },
  ];

  it("prueba las demás métricas en vez de rendirse con la que sorteó", () => {
    for (let i = 0; i < 60; i += 1) {
      const ronda = generarRonda(conAltitudesIguales, crearAleatorio(`m${i}`), 0);
      expect(ronda.metrica).not.toBe("altitud");
    }
  });

  it("no se rinde cuando excluir deja sin pares separados pero quedan dos pueblos", () => {
    const cuatro: Pueblo[] = [
      { id: "A", nombre: "A", provincia: "P", habitantes: 10, altitud: 10, extension: 1 },
      { id: "B", nombre: "B", provincia: "P", habitantes: 5000, altitud: 900, extension: 500 },
      { id: "C", nombre: "C", provincia: "P", habitantes: 100, altitud: 100, extension: 10 },
      { id: "D", nombre: "D", provincia: "P", habitantes: 100, altitud: 100, extension: 10 },
    ];
    for (let i = 0; i < 30; i += 1) {
      const ronda = generarRonda(cuatro, crearAleatorio(`x${i}`), 0, new Set(["A", "B"]));
      expect(ronda.par[0].id).not.toBe(ronda.par[1].id);
    }
  });
});

describe("generarRonda: el último recurso", () => {
  // Valores tan juntos que ningún escalón de relajación los acepta.
  const apelmazado: Pueblo[] = [1000, 1001, 1002, 1003].map((v, i) => ({
    id: `P${i}`, nombre: `P${i}`, provincia: "P", habitantes: v, altitud: v, extension: v,
  }));

  it("no devuelve siempre el mismo par", () => {
    const r = crearAleatorio("recurso");
    const pares = new Set(
      Array.from({ length: 50 }, () => {
        const { par } = generarRonda(apelmazado, r, 30);
        return [par[0].id, par[1].id].sort().join("-");
      }),
    );
    expect(pares.size).toBeGreaterThan(1);
  });

  it("sigue sin enfrentar un pueblo contra sí mismo", () => {
    const r = crearAleatorio("recurso");
    for (let i = 0; i < 50; i += 1) {
      const { par } = generarRonda(apelmazado, r, 30);
      expect(par[0].id).not.toBe(par[1].id);
    }
  });
});
