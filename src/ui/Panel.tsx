import { useEffect, useRef, useState, type ReactNode } from "react";

/** Lo que el tabulador puede alcanzar dentro del panel, en orden. */
function alcanzables(raiz: HTMLElement): HTMLElement[] {
  return Array.from(
    raiz.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

type Props = {
  etiqueta: string;
  titulo: string;
  children: ReactNode;
};

/**
 * Un texto que se abre encima del juego en vez de ser una página aparte.
 * GitHub Pages no tiene fallback de SPA: una ruta propia daría 404 al
 * recargarla, y habría que meter un enrutador para una pantalla de texto
 * (ADR 0010).
 */
export function Panel({ etiqueta, titulo, children }: Props) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idTitulo = `titulo-panel-${titulo.replace(/\s+/g, "-").toLowerCase()}`;

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
        {etiqueta}
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
            aria-labelledby={idTitulo}
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
            {/* Pegada arriba: al bajar en el móvil, la salida se quedaba fuera
                de la pantalla. */}
            <div className="sticky top-0 -mt-2 flex items-start justify-between gap-4 bg-white pb-2 pt-2">
              <h2 id={idTitulo} className="text-2xl font-bold text-slate-900">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                className="-m-2 shrink-0 rounded-full p-2 text-2xl leading-none text-slate-500 hover:text-slate-900"
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Cerrar</span>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-slate-700">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
