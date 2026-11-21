import type { Catalogo, Pueblo } from "./dominio/tipos.js";
import snapshot from "./data/snapshot.json";

/**
 * El catálogo real, generado por `npm run datos` y versionado en el repo
 * (ADR 0003). Se valida al cargar: un snapshot mal generado tiene que romper
 * aquí y no en mitad de una partida.
 */
function esPueblo(valor: unknown): valor is Pueblo {
  const p = valor as Pueblo;
  return (
    typeof p?.id === "string" &&
    typeof p.nombre === "string" &&
    typeof p.provincia === "string" &&
    Number.isFinite(p.habitantes) &&
    Number.isFinite(p.altitud) &&
    Number.isFinite(p.extension)
  );
}

export function cargarCatalogo(): Catalogo {
  const pueblos = snapshot.pueblos;
  if (!Array.isArray(pueblos) || pueblos.length < 1000) {
    throw new Error(`El snapshot trae ${pueblos?.length ?? 0} pueblos: algo ha fallado al generarlo`);
  }
  const malos = pueblos.filter((p) => !esPueblo(p));
  if (malos.length > 0) {
    throw new Error(`${malos.length} pueblos del snapshot no tienen la forma esperada`);
  }
  return pueblos;
}
