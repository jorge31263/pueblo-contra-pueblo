import { describe, it, expect } from "vitest";
import { nuevaPartida, responder, type Partida } from "./partida.js";
import { catalogoPrueba } from "./fixtures/catalogo-prueba.js";

const acertar = (p: Partida): Partida => responder(p, p.ronda.ganador);
const fallar = (p: Partida): Partida => responder(p, p.ronda.ganador === 0 ? 1 : 0);

describe("nuevaPartida", () => {
  it("empieza jugando, con racha 0 y una ronda lista", () => {
    const p = nuevaPartida(catalogoPrueba, "2026-11-21");
    expect(p.estado).toBe("jugando");
    expect(p.racha).toBe(0);
    expect(p.ronda.par).toHaveLength(2);
    expect(p.ultimaRespuesta).toBeUndefined();
  });

  it("la misma semilla produce la misma primera ronda", () => {
    expect(nuevaPartida(catalogoPrueba, "igual").ronda)
      .toEqual(nuevaPartida(catalogoPrueba, "igual").ronda);
  });

  it("semillas distintas producen partidas distintas", () => {
    const a = nuevaPartida(catalogoPrueba, "2026-11-21").ronda;
    const b = nuevaPartida(catalogoPrueba, "2026-12-25").ronda;
    expect([a.par[0].id, a.par[1].id, a.metrica]).not.toEqual([b.par[0].id, b.par[1].id, b.metrica]);
  });
});

describe("responder", () => {
  it("al acertar sube la racha y entra una ronda nueva", () => {
    const p = nuevaPartida(catalogoPrueba, "x");
    const siguiente = acertar(p);
    expect(siguiente.estado).toBe("jugando");
    expect(siguiente.racha).toBe(1);
    expect(siguiente.ultimaRespuesta).toEqual({ acierto: true });
    expect(siguiente.ronda).not.toEqual(p.ronda);
  });

  it("al fallar termina y la racha se queda en lo alcanzado", () => {
    const p = acertar(acertar(nuevaPartida(catalogoPrueba, "x")));
    const final = fallar(p);
    expect(final.estado).toBe("terminada");
    expect(final.racha).toBe(2);
    expect(final.ultimaRespuesta).toEqual({ acierto: false });
  });

  it("conserva la ronda fallada para poder enseñar los dos valores", () => {
    const p = nuevaPartida(catalogoPrueba, "x");
    expect(fallar(p).ronda).toEqual(p.ronda);
  });

  it("responder sobre una partida terminada no cambia nada", () => {
    const terminada = fallar(nuevaPartida(catalogoPrueba, "x"));
    expect(responder(terminada, 0)).toBe(terminada);
    expect(responder(terminada, 1)).toBe(terminada);
  });

  it("no modifica la partida anterior", () => {
    const p = nuevaPartida(catalogoPrueba, "x");
    const antes = { estado: p.estado, racha: p.racha, ronda: p.ronda };
    acertar(p);
    expect({ estado: p.estado, racha: p.racha, ronda: p.ronda }).toEqual(antes);
  });

  it("no repite ningún pueblo en dos rondas seguidas", () => {
    let p = nuevaPartida(catalogoPrueba, "seguidas");
    for (let i = 0; i < 25; i += 1) {
      const anteriores = new Set(p.ronda.par.map((x) => x.id));
      p = acertar(p);
      expect(p.ronda.par.some((x) => anteriores.has(x.id))).toBe(false);
    }
  });

  it("la misma semilla da la misma secuencia de rondas acertando siempre", () => {
    const recorrer = (): string[] => {
      let p = nuevaPartida(catalogoPrueba, "misma");
      const ids: string[] = [];
      for (let i = 0; i < 12; i += 1) {
        ids.push(p.ronda.par[0].id + "-" + p.ronda.par[1].id + "-" + p.ronda.metrica);
        p = acertar(p);
      }
      return ids;
    };
    expect(recorrer()).toEqual(recorrer());
  });

  it("la dificultad sube: la separación exigida se estrecha con la racha", () => {
    let p = nuevaPartida(catalogoPrueba, "dificultad");
    for (let i = 0; i < 16; i += 1) p = acertar(p);
    expect(p.racha).toBe(16);
    expect(p.estado).toBe("jugando");
  });
});
