import type { Metrica, Pueblo } from "../dominio/tipos.js";
import { Contador } from "./Contador.js";

type Props = {
  pueblo: Pueblo;
  metrica: Metrica;
  revelado: boolean;
  elegido: boolean;
  gana: boolean;
  onElegir: () => void;
};

/**
 * De cada pueblo solo el nombre y la provincia (ADR 0006): un mapa o una foto
 * regalarían la altitud y la extensión.
 *
 * El botón no se desactiva al revelar, se ignora: `disabled` devuelve el foco
 * al cuerpo del documento y quien juega con el tabulador pierde el sitio en
 * cada ronda. Y no lleva `aria-label`, que sustituiría al contenido y dejaría
 * la cifra revelada fuera del alcance de un lector de pantalla.
 */
export function TarjetaPueblo({ pueblo, metrica, revelado, elegido, gana, onElegir }: Props) {
  const borde = !revelado
    ? "border-slate-300 hover:border-slate-900 hover:bg-slate-50"
    : gana
      ? "border-emerald-600 bg-emerald-50"
      : "border-slate-300 bg-slate-50";

  return (
    <button
      type="button"
      onClick={() => !revelado && onElegir()}
      aria-disabled={revelado}
      className={`flex min-h-44 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-6 text-center transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${borde}`}
    >
      <span className="text-2xl font-semibold text-slate-900">{pueblo.nombre}</span>
      <span className="text-sm text-slate-500">{pueblo.provincia}</span>
      {revelado && (
        <span className="mt-3 text-xl font-bold tabular-nums text-slate-900">
          <Contador valor={pueblo[metrica]} metrica={metrica} />
        </span>
      )}
      {revelado && elegido && <span className="text-xs uppercase text-slate-500">tu elección</span>}
    </button>
  );
}
