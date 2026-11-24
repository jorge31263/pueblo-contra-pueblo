import type { Catalogo, Pueblo } from "./dominio/tipos.js";

/**
 * El catálogo real lo genera `npm run datos` y se sirve como fichero estático
 * aparte del JavaScript (ADR 0003: sigue sin haber servidor). Empaquetarlo
 * dentro del JS eran 900 kB antes de la primera pregunta.
 *
 * Se valida al cargar: un snapshot mal generado tiene que romper aquí, con un
 * mensaje, y no en mitad de una partida.
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

export function validarCatalogo(datos: unknown): Catalogo {
  const pueblos = (datos as { pueblos?: unknown })?.pueblos;
  if (!Array.isArray(pueblos) || pueblos.length < 1000) {
    throw new Error(
      `El snapshot trae ${Array.isArray(pueblos) ? pueblos.length : 0} pueblos: algo ha fallado al generarlo`,
    );
  }
  const malos = pueblos.filter((p) => !esPueblo(p));
  if (malos.length > 0) {
    throw new Error(`${malos.length} pueblos del snapshot no tienen la forma esperada`);
  }
  return pueblos as Catalogo;
}

/** De dónde salen las cifras y de cuándo son, tal como lo dejó el pipeline. */
export type Fuentes = {
  generadoEl?: string;
  padron?: string;
  ngmep?: string;
};

/**
 * La procedencia se lee con la mano abierta, al revés que los pueblos: un
 * snapshot al que le falte se juega igual, así que aquí no se valida nada, se
 * coge lo que haya. Lo que no está, no se enseña.
 */
export function leerFuentes(datos: unknown): Fuentes {
  const d = datos as { generadoEl?: unknown; fuentes?: { padron?: unknown; ngmep?: unknown } };
  const texto = (valor: unknown) =>
    typeof valor === "string" && valor.length > 0 ? valor : undefined;
  return {
    generadoEl: texto(d?.generadoEl),
    padron: texto(d?.fuentes?.padron),
    ngmep: texto(d?.fuentes?.ngmep),
  };
}

export async function cargarSnapshot(
  url = "./snapshot.json",
): Promise<{ catalogo: Catalogo; fuentes: Fuentes }> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No he podido cargar los pueblos (${respuesta.status})`);
  }
  const datos: unknown = await respuesta.json();
  return { catalogo: validarCatalogo(datos), fuentes: leerFuentes(datos) };
}
