import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { cargarCatalogo } from "./catalogo.js";
import "./estilos.css";

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <App catalogo={cargarCatalogo()} />
  </StrictMode>,
);
