import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { cargarCatalogo } from "./catalogo.js";
import { Pie } from "./ui/Pie.js";
import "./estilos.css";

/**
 * La caché propia solo en producción: en desarrollo serviría versiones viejas
 * de ficheros que acabas de cambiar y te volvería loco.
 */
function registrarCacheOffline(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./sw.js").catch(() => {
      // Sin caché offline se juega igual; no es motivo para molestar a nadie.
    });
  });
}

registrarCacheOffline();

const raiz = createRoot(document.getElementById("raiz")!);

cargarCatalogo()
  .then((catalogo) =>
    raiz.render(
      <StrictMode>
        <App catalogo={catalogo} />
        <Pie />
      </StrictMode>,
    ),
  )
  .catch((error: unknown) =>
    // Una pantalla en blanco no le dice nada a nadie.
    raiz.render(
      <>
        <p className="mx-auto max-w-md px-4 py-16 text-center text-slate-600">
          No he podido cargar los pueblos. Prueba a recargar la página.
          <br />
          <span className="text-sm text-slate-400">
            {error instanceof Error ? error.message : String(error)}
          </span>
        </p>
        <Pie />
      </>,
    ),
  );
