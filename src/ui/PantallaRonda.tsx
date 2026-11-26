import { useEffect, useRef, useState } from "react";
import type { Ronda } from "../dominio/tipos.js";
import { MILISEGUNDOS_DE_REVELADO, SEGUNDOS_DE_AVISO } from "../dominio/parametros.js";
import { etiquetaMetrica } from "./etiquetas.js";
import { TarjetaPueblo } from "./TarjetaPueblo.js";

type Props = {
  ronda: Ronda;
  racha: number;
  onElegir: (eleccion: 0 | 1) => void;
  /** Segundos por ronda. Sin esto no hay reloj, que es el modo libre. */
  segundos?: number;
  onAgotado?: () => void;
  /**
   * Salida a mitad de partida, solo donde tiene sentido. Instalado en el móvil
   * no hay barra de navegador, así que sin esto la única forma de salir de una
   * ronda es responder. En el reto diario no se ofrece: poder abandonar la
   * ronda que no te sabes y volver a empezar se carga el intento único.
   */
  onDejarlo?: () => void;
};

/**
 * Una ronda en pantalla. La elección se bloquea en cuanto hay respuesta, así
 * que una segunda pulsación durante el revelado no cuenta.
 *
 * Al acertar avisa al padre pasado el revelado y la partida sigue sola. Al
 * fallar no avanza: la pantalla se queda con los dos valores a la vista y el
 * jugador decide cuándo mirar el resultado.
 *
 * El reloj, si lo hay, se para en cuanto se elige: el revelado no consume
 * tiempo de la ronda.
 */
export function PantallaRonda({
  ronda,
  racha,
  onElegir,
  segundos,
  onAgotado,
  onDejarlo,
}: Props) {
  const [eleccion, setEleccion] = useState<0 | 1 | null>(null);
  const eleccionRef = useRef<0 | 1 | null>(null);
  const acierto = eleccion !== null && eleccion === ronda.ganador;

  // Cada ronda llega limpia aunque el componente no se desmonte.
  useEffect(() => {
    eleccionRef.current = null;
    setEleccion(null);
  }, [ronda]);

  useEffect(() => {
    if (!acierto || eleccion === null) return;
    const reloj = setTimeout(() => onElegir(eleccion), MILISEGUNDOS_DE_REVELADO);
    return () => clearTimeout(reloj);
  }, [acierto, eleccion, onElegir]);

  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
      // El guardia va aquí dentro y no en las dependencias del efecto: dos
      // teclas en el mismo tick llegarían las dos al listener anterior, y la
      // segunda convertiría un acierto en el final de la partida.
      if (eleccionRef.current !== null) return;
      // Sin esto, las flechas eligen y además hacen scroll de la página.
      evento.preventDefault();
      const elegida = evento.key === "ArrowLeft" ? 0 : 1;
      eleccionRef.current = elegida;
      setEleccion(elegida);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  const [restan, setRestan] = useState(segundos ?? 0);

  useEffect(() => setRestan(segundos ?? 0), [ronda, segundos]);

  useEffect(() => {
    if (segundos === undefined || eleccion !== null) return;
    const tic = setInterval(() => setRestan((quedan) => Math.max(quedan - 1, 0)), 1000);
    return () => clearInterval(tic);
  }, [ronda, segundos, eleccion]);

  useEffect(() => {
    if (segundos === undefined || eleccion !== null || restan > 0) return;
    onAgotado?.();
  }, [restan, segundos, eleccion, onAgotado]);

  const revelado = eleccion !== null;
  const elegir = (indice: 0 | 1) => {
    if (eleccionRef.current !== null) return;
    eleccionRef.current = indice;
    setEleccion(indice);
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-center gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Racha {racha}</p>
        {segundos !== undefined && (
          <p
            role="timer"
            // En el árbol de accesibilidad siempre, para poder consultarlo,
            // pero sin anunciarse: cantar cada segundo sería insufrible. El
            // aviso de que queda poco va por la región de abajo.
            aria-live="off"
            aria-label={`Quedan ${restan} segundos`}
            className={`tabular-nums text-sm font-bold ${
              restan <= SEGUNDOS_DE_AVISO ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {restan}s
          </p>
        )}
      </div>

      {/*
        Sin esto, un lector de pantalla oye "Correcto" y luego silencio: la
        pregunta y los dos pueblos cambian sin anunciarse.
      */}
      <p aria-live="polite" className="sr-only">
        {segundos !== undefined && !revelado && restan === SEGUNDOS_DE_AVISO
          ? `Quedan ${SEGUNDOS_DE_AVISO} segundos.`
          : ""}
      </p>

      <p aria-live="polite" className="sr-only">
        {`Ronda ${racha + 1}. ${etiquetaMetrica(ronda.metrica)} ${ronda.par[0].nombre}, ${ronda.par[0].provincia}, o ${ronda.par[1].nombre}, ${ronda.par[1].provincia}.`}
      </p>
      <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        {etiquetaMetrica(ronda.metrica)}
      </h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        {ronda.par.map((pueblo, indice) => (
          <TarjetaPueblo
            key={pueblo.id}
            pueblo={pueblo}
            metrica={ronda.metrica}
            revelado={revelado}
            elegido={eleccion === indice}
            gana={ronda.ganador === indice}
            onElegir={() => elegir(indice === 0 ? 0 : 1)}
          />
        ))}
      </div>

      <p aria-live="polite" className="min-h-8 text-center text-lg font-semibold">
        {revelado &&
          (acierto ? (
            <span className="text-emerald-700">✓ Correcto</span>
          ) : (
            <span className="text-rose-700">✗ Fallo</span>
          ))}
      </p>

      {revelado && !acierto && (
        <button
          type="button"
          onClick={() => onElegir(eleccion)}
          className="mx-auto rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          Ver resultado
        </button>
      )}

      {!revelado && (
        <p className="text-center text-sm text-slate-500">
          Toca el que creas que gana. Con teclado, las flechas ← →
        </p>
      )}

      {/* Después de los pueblos: el tabulador llega a lo de jugar antes que a
          lo de irse. */}
      {onDejarlo !== undefined && (
        <button
          type="button"
          onClick={onDejarlo}
          className="mx-auto text-sm text-slate-500 underline hover:text-slate-900"
        >
          Dejar la partida
        </button>
      )}
    </main>
  );
}
