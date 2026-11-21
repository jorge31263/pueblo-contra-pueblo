import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { cargarCatalogo } from "./catalogo.js";
import { Pie } from "./ui/Pie.js";
import "./estilos.css";

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
