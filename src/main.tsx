import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { catalogoPrueba } from "./dominio/fixtures/catalogo-prueba.js";
import "./estilos.css";

createRoot(document.getElementById("raiz")!).render(
  <StrictMode>
    <App catalogo={catalogoPrueba} />
  </StrictMode>,
);
