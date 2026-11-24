import type { Ronda } from "../dominio/tipos.js";
import type { Modo } from "../almacenamiento.js";
import { formatearValor } from "./etiquetas.js";
import { BotonCompartir } from "./BotonCompartir.js";
import { ComoSeJuega } from "./ComoSeJuega.js";
import { DeDondeSalenLosDatos } from "./DeDondeSalenLosDatos.js";
import { AvisoLegal } from "./AvisoLegal.js";
import type { Fuentes } from "../catalogo.js";

type Props = {
  fuentes: Fuentes;
  racha: number;
  mejor: number;
  modo: Modo;
  semilla: string;
  url: string;
  ronda: Ronda;
  porTiempo: boolean;
  onOtraVez: () => void;
  onInicio: () => void;
};

/** El final de la partida, con la ronda que la cerró a la vista. */
export function PantallaResumen({
  fuentes,
  racha, mejor, modo, semilla, url, ronda, porTiempo, onOtraVez, onInicio,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Se acabó</h1>
      {porTiempo && <p className="text-rose-700">Se te acabó el tiempo</p>}
      <p className="text-6xl font-bold tabular-nums text-slate-900">{racha}</p>
      <p className="text-slate-600">
        {racha === 1 ? "acierto seguido" : "aciertos seguidos"}
        {mejor > racha && ` · tu mejor racha es ${mejor}`}
        {mejor === racha && racha > 0 && " · es tu mejor racha"}
      </p>

      <div className="w-full rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="mb-2 font-medium text-slate-900">La que te pilló:</p>
        {ronda.par.map((pueblo) => (
          <p key={pueblo.id}>
            {pueblo.nombre} ({pueblo.provincia}): {formatearValor(pueblo[ronda.metrica], ronda.metrica)}
          </p>
        ))}
      </div>

      <BotonCompartir resultado={{ racha, semilla, modo, url }} />

      {modo === "libre" && (
        <button
          type="button"
          onClick={onOtraVez}
          className="w-full rounded-full border-2 border-slate-900 px-6 py-3 font-semibold text-slate-900"
        >
          Otra vez
        </button>
      )}
      <button type="button" onClick={onInicio} className="text-sm text-slate-500 underline">
        Volver al inicio
      </button>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <ComoSeJuega />
        <DeDondeSalenLosDatos fuentes={fuentes} />
        <AvisoLegal />
      </div>
    </main>
  );
}
