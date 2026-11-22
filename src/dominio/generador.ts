import type { Catalogo, Metrica, Pueblo, Ronda } from "./tipos.js";
import { METRICAS } from "./tipos.js";
import { elegirUno } from "./aleatorio.js";
import { separadosPor, umbralesDeRelajacion } from "./separacion.js";
import { INTENTOS_POR_ESCALON } from "./parametros.js";

/**
 * Sortea un par de pueblos que esté lo bastante separado para la racha actual.
 *
 * Si tras un número acotado de intentos no aparece ninguno, baja un escalón la
 * separación exigida y vuelve a probar; el último recurso es cualquier par con
 * valores distintos. Nunca gira sin final: con un catálogo degenerado avisa en
 * lugar de colgar la pestaña.
 *
 * La métrica sorteada puede no tener ningún par separado aunque otra sí lo
 * tenga, así que se prueban las tres antes de rendirse. Rendirse sería lanzar
 * en mitad de una partida.
 *
 * `excluidos` son los pueblos de la ronda anterior, que no deben repetirse. Es
 * una preferencia, no una condición: si al excluirlos no sale ninguna ronda,
 * se juega con el catálogo entero antes que quedarse sin ella.
 */
export function generarRonda(
  catalogo: Catalogo,
  aleatorio: () => number,
  racha: number,
  excluidos: ReadonlySet<string> = new Set(),
): Ronda {
  if (catalogo.length < 2) {
    throw new Error("Hacen falta al menos dos pueblos para montar una ronda");
  }

  const sorteada = elegirUno(METRICAS, aleatorio);
  const porOrden = [sorteada, ...METRICAS.filter((m) => m !== sorteada)];
  const disponibles = catalogo.filter((p) => !excluidos.has(p.id));

  for (const dondeBuscar of [disponibles, catalogo]) {
    if (dondeBuscar.length < 2) continue;
    for (const metrica of porOrden) {
      for (const umbral of umbralesDeRelajacion(metrica, Math.max(racha, 0))) {
        const par = buscarPar(dondeBuscar, aleatorio, metrica, umbral);
        if (par !== undefined) return montar(par, metrica);
      }
      const cualquiera = parDistintoCualquiera(dondeBuscar, metrica, aleatorio);
      if (cualquiera !== undefined) return montar(cualquiera, metrica);
    }
  }

  throw new Error(
    `No hay en el catálogo dos pueblos con valores distintos en ninguna métrica: ` +
      `con ${catalogo.length} pueblos no se puede formar una ronda`,
  );
}

function buscarPar(
  catalogo: Catalogo,
  aleatorio: () => number,
  metrica: Metrica,
  umbral: number,
): [Pueblo, Pueblo] | undefined {
  for (let intento = 0; intento < INTENTOS_POR_ESCALON; intento += 1) {
    const a = elegirUno(catalogo, aleatorio);
    const b = elegirUno(catalogo, aleatorio);
    if (a.id === b.id) continue;
    if (separadosPor(a, b, metrica, umbral)) return [a, b];
  }
  return undefined;
}

/**
 * Último recurso: cualquier par con valores distintos. Recorre el catálogo
 * entero para terminar siempre, pero empieza en un punto sorteado: si no, en
 * un catálogo apelmazado saldría la misma ronda una y otra vez.
 */
function parDistintoCualquiera(
  catalogo: Catalogo,
  metrica: Metrica,
  aleatorio: () => number,
): [Pueblo, Pueblo] | undefined {
  const n = catalogo.length;
  const desde = Math.floor(aleatorio() * n);
  for (let p = 0; p < n; p += 1) {
    for (let q = 1; q < n; q += 1) {
      const a = catalogo[(desde + p) % n]!;
      const b = catalogo[(desde + p + q) % n]!;
      if (a.id !== b.id && a[metrica] !== b[metrica]) return [a, b];
    }
  }
  return undefined;
}

function montar(par: [Pueblo, Pueblo], metrica: Metrica): Ronda {
  return { par, metrica, ganador: par[0][metrica] > par[1][metrica] ? 0 : 1 };
}
