import { useEffect, useState } from "react";
import type { Ronda } from "../dominio/tipos.js";
import { MILISEGUNDOS_DE_REVELADO } from "../dominio/parametros.js";
import { etiquetaMetrica } from "./etiquetas.js";
import { TarjetaPueblo } from "./TarjetaPueblo.js";

type Props = {
  ronda: Ronda;
  racha: number;
  onElegir: (eleccion: 0 | 1) => void;
};

/**
 * Una ronda en pantalla. La elección se bloquea en cuanto hay respuesta, así
 * que una segunda pulsación durante el revelado no cuenta.
 *
 * Al acertar avisa al padre pasado el revelado y la partida sigue sola. Al
 * fallar no avanza: la pantalla se queda con los dos valores a la vista y el
 * jugador decide cuándo mirar el resultado.
 */
export function PantallaRonda({ ronda, racha, onElegir }: Props) {
  const [eleccion, setEleccion] = useState<0 | 1 | null>(null);
  const acierto = eleccion !== null && eleccion === ronda.ganador;

  // Cada ronda llega limpia aunque el componente no se desmonte.
  useEffect(() => setEleccion(null), [ronda]);

  useEffect(() => {
    if (!acierto || eleccion === null) return;
    const reloj = setTimeout(() => onElegir(eleccion), MILISEGUNDOS_DE_REVELADO);
    return () => clearTimeout(reloj);
  }, [acierto, eleccion, onElegir]);

  useEffect(() => {
    if (eleccion !== null) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowLeft") setEleccion(0);
      if (evento.key === "ArrowRight") setEleccion(1);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [eleccion]);

  const revelado = eleccion !== null;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-500">
        Racha {racha}
      </p>
      <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        {etiquetaMetrica(ronda.metrica)}
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        {ronda.par.map((pueblo, indice) => (
          <TarjetaPueblo
            key={pueblo.id}
            pueblo={pueblo}
            metrica={ronda.metrica}
            revelado={revelado}
            elegido={eleccion === indice}
            gana={ronda.ganador === indice}
            onElegir={() => setEleccion(indice === 0 ? 0 : 1)}
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
        <p className="text-center text-sm text-slate-400">
          Elige con el ratón o con las flechas ← →
        </p>
      )}
    </section>
  );
}
