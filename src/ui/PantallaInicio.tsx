import { ComoSeJuega } from "./ComoSeJuega.js";

type Props = {
  diarioJugado: boolean;
  mejorDiario: number;
  mejorLibre: number;
  onJugarDiario: () => void;
  onJugarLibre: () => void;
};

export function PantallaInicio({
  diarioJugado,
  mejorDiario,
  mejorLibre,
  onJugarDiario,
  onJugarLibre,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-12 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Pueblo contra pueblo</h1>
      <p className="text-lg text-slate-600">
        Dos pueblos, una pregunta. Acierta cuál gana y encadena la racha más larga que puedas.
      </p>

      {diarioJugado ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
          Ya has jugado el reto de hoy. Vuelve mañana, o sigue en el modo libre.
        </p>
      ) : (
        <button
          type="button"
          onClick={onJugarDiario}
          className="w-full rounded-full bg-slate-900 px-6 py-4 text-lg font-semibold text-white"
        >
          Jugar el reto de hoy
        </button>
      )}

      <button
        type="button"
        onClick={onJugarLibre}
        className="w-full rounded-full border-2 border-slate-900 px-6 py-4 text-lg font-semibold text-slate-900"
      >
        Modo libre
      </button>

      <dl className="flex gap-8 text-sm text-slate-500">
        <div>
          <dt>Mejor racha en el reto</dt>
          <dd className="text-2xl font-bold text-slate-900">{mejorDiario}</dd>
        </div>
        <div>
          <dt>Mejor racha libre</dt>
          <dd className="text-2xl font-bold text-slate-900">{mejorLibre}</dd>
        </div>
      </dl>

      <ComoSeJuega />
    </main>
  );
}
