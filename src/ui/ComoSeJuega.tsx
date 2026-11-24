import { useEffect, useRef, useState } from "react";
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

/** Lo que el tabulador puede alcanzar dentro del panel, en orden. */
function alcanzables(raiz: HTMLElement): HTMLElement[] {
  return Array.from(
    raiz.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/**
 * El panel se abre encima del juego en vez de ser una página aparte. GitHub
 * Pages no tiene fallback de SPA: una ruta propia daría 404 al recargarla, y
 * además habría que meter un enrutador para una pantalla de texto.
 */
export function ComoSeJuega() {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) panel.current?.focus();
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    // Quien abrió con el teclado tiene que volver a donde estaba, no al
    // principio del documento.
    boton.current?.focus();
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm text-slate-500 underline hover:text-slate-900"
      >
        Cómo se juega
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-10 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) cerrar();
          }}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-como-se-juega"
            tabIndex={-1}
            onKeyDown={(evento) => {
              if (evento.key === "Escape") {
                cerrar();
                return;
              }
              if (evento.key !== "Tab" || panel.current === null) return;
              // Con aria-modal puesto, dejar salir el tabulador al juego de
              // detrás es prometer una cosa y hacer otra.
              const dentro = alcanzables(panel.current);
              const primero = dentro[0];
              const ultimo = dentro[dentro.length - 1];
              if (primero === undefined || ultimo === undefined) {
                evento.preventDefault();
                panel.current.focus();
                return;
              }
              if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault();
                ultimo.focus();
              } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primero.focus();
              }
            }}
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-6 text-left shadow-xl sm:rounded-2xl"
          >
            {/* Pegada arriba: al bajar en el móvil, la salida se quedaba fuera de la pantalla. */}
            <div className="sticky top-0 -mt-2 flex items-start justify-between gap-4 bg-white pb-2 pt-2">
              <h2 id="titulo-como-se-juega" className="text-2xl font-bold text-slate-900">
                Cómo se juega
              </h2>
              <button
                type="button"
                onClick={cerrar}
                className="-m-2 shrink-0 rounded-full p-2 text-2xl leading-none text-slate-400 hover:text-slate-900"
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Cerrar</span>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-slate-700">
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
                reloj y se juega las veces que quieras. Cada partida tiene una semilla que puedes
                pasarle a alguien para que le toquen tus mismas rondas.
              </p>
              <p>
                Solo salen municipios de menos de 20.000 habitantes. Con Madrid en el juego,
                media partida se resolvería sin pensar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
