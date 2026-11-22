import type { Catalogo, Ronda } from "./tipos.js";
import { crearAleatorio } from "./aleatorio.js";
import { generarRonda } from "./generador.js";

/**
 * Una partida empieza en la primera ronda y acaba en el primer fallo. La racha
 * es la única cifra que el juego mide.
 *
 * La partida es inmutable: `responder` devuelve una nueva, y llamarlo dos
 * veces sobre la misma partida da exactamente la misma ronda. Para eso cada
 * ronda nace de un generador propio sembrado con `semilla:racha`, en vez de
 * compartir uno con estado que avanzaría al llamarlo otra vez.
 */
export type Partida = {
  readonly semilla: string;
  readonly ronda: Ronda;
  readonly racha: number;
  readonly estado: "jugando" | "terminada";
  readonly ultimaRespuesta?: { readonly acierto: boolean; readonly porTiempo?: boolean };
  /** Interno: el catálogo con el que sigue la partida. */
  readonly catalogo: Catalogo;
};

/** La ronda de una racha concreta, siempre la misma para la misma semilla. */
function rondaDe(
  catalogo: Catalogo,
  semilla: string,
  racha: number,
  excluidos?: ReadonlySet<string>,
) {
  return generarRonda(catalogo, crearAleatorio(`${semilla}:${racha}`), racha, excluidos);
}

export function nuevaPartida(catalogo: Catalogo, semilla: string): Partida {
  return {
    semilla,
    ronda: rondaDe(catalogo, semilla, 0),
    racha: 0,
    estado: "jugando",
    catalogo,
  };
}

/**
 * Se acabó el tiempo de la ronda. Cuenta como fallo y termina la partida, con
 * la ronda a la vista para que el jugador vea qué se le escapó.
 */
export function agotarTiempo(partida: Partida): Partida {
  if (partida.estado === "terminada") return partida;
  return { ...partida, estado: "terminada", ultimaRespuesta: { acierto: false, porTiempo: true } };
}

export function responder(partida: Partida, eleccion: 0 | 1): Partida {
  // Es también la defensa contra la doble pulsación durante el revelado.
  if (partida.estado === "terminada") return partida;

  if (eleccion !== partida.ronda.ganador) {
    // La ronda fallada se conserva: la pantalla de resumen enseña los dos
    // valores y el jugador ve por cuánto se equivocó.
    return { ...partida, estado: "terminada", ultimaRespuesta: { acierto: false } };
  }

  const racha = partida.racha + 1;
  const anteriores = new Set(partida.ronda.par.map((p) => p.id));
  return {
    ...partida,
    ronda: rondaDe(partida.catalogo, partida.semilla, racha, anteriores),
    racha,
    estado: "jugando",
    ultimaRespuesta: { acierto: true },
  };
}
