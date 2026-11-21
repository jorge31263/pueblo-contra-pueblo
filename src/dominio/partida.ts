import type { Catalogo, Ronda } from "./tipos.js";
import { crearAleatorio } from "./aleatorio.js";
import { generarRonda } from "./generador.js";

/**
 * Una partida empieza en la primera ronda y acaba en el primer fallo. La racha
 * es la única cifra que el juego mide.
 *
 * La partida es inmutable: `responder` devuelve una nueva. Lleva dentro su
 * propio generador aleatorio, creado de la semilla, para que la secuencia
 * dependa solo de ella y de nada más.
 */
export type Partida = {
  readonly semilla: string;
  readonly ronda: Ronda;
  readonly racha: number;
  readonly estado: "jugando" | "terminada";
  readonly ultimaRespuesta?: { readonly acierto: boolean };
  /** Interno: el azar sembrado y el catálogo con los que sigue la partida. */
  readonly motor: Motor;
};

type Motor = {
  readonly catalogo: Catalogo;
  readonly aleatorio: () => number;
};

export function nuevaPartida(catalogo: Catalogo, semilla: string): Partida {
  const motor: Motor = { catalogo, aleatorio: crearAleatorio(semilla) };
  return {
    semilla,
    ronda: generarRonda(catalogo, motor.aleatorio, 0),
    racha: 0,
    estado: "jugando",
    motor,
  };
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
    ronda: generarRonda(partida.motor.catalogo, partida.motor.aleatorio, racha, anteriores),
    racha,
    estado: "jugando",
    ultimaRespuesta: { acierto: true },
  };
}
