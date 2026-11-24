import { Panel } from "./Panel.js";
import {
  PARAMETROS,
  RACHA_MAS_DIFICIL,
  SEGUNDOS_POR_RONDA,
} from "../dominio/parametros.js";

/**
 * Las reglas salen de los mismos parámetros que usa el generador. Si alguien
 * afina la curva de dificultad y el texto se queda con las cifras viejas, el
 * jugador razona con un margen que el juego ya no respeta: unas reglas que
 * mienten son peores que no tener reglas.
 */
const VECES_AL_PRINCIPIO = PARAMETROS.habitantes.alPrincipio.toLocaleString("es-ES");
const MARGEN_AL_FINAL = Math.round((PARAMETROS.habitantes.alFinal - 1) * 100);

export function ComoSeJuega() {
  return (
    <Panel etiqueta="Cómo se juega" titulo="Cómo se juega">
        <p>
          Salen dos pueblos y una pregunta: cuál tiene más habitantes, cuál está a más
          altitud o cuál tiene más extensión. Eliges uno. Si aciertas sigue otro par, y
          si fallas se acaba la partida.
        </p>
        <p>
          De cada pueblo se ve el nombre y la provincia, y nada más. Un mapa regalaría
          media respuesta.
        </p>
        <p>
          Los pares no salen al azar. El juego exige que los dos valores estén lo bastante
          separados para que la pregunta se pueda razonar, y aprieta conforme sube la
          racha: en la primera ronda el ganador saca al otro {VECES_AL_PRINCIPIO} veces, y
          a partir de la ronda {RACHA_MAS_DIFICIL} le basta con un {MARGEN_AL_FINAL}%. Con
          la altitud la cuenta va en metros, porque un pueblo a 2 m y otro a 6 m guardan la
          misma proporción que 400 y 1.200 y no se parecen en nada.
        </p>
        <p>
          <strong className="font-semibold text-slate-900">El reto de cada día</strong> es
          el mismo para todo el mundo y tienes un intento. Ahí cada ronda dura{" "}
          {SEGUNDOS_POR_RONDA} segundos, que dan para leer los dos nombres y pensar, y no
          para buscarlo en internet.
        </p>
        <p>
          <strong className="font-semibold text-slate-900">El modo libre</strong> no lleva
          reloj, se juega las veces que quieras y se puede dejar a medias sin perder
          lo que lleves acertado. Cada partida tiene una semilla que puedes
          pasarle a alguien para que le toquen tus mismas rondas.
        </p>
        <p>
          Solo salen municipios de menos de 20.000 habitantes. Con Madrid en el juego,
          media partida se resolvería sin pensar.
        </p>
      
    </Panel>
  );
}
