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

export async function cargarCatalogo(url = "./snapshot.json"): Promise<Catalogo> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`No he podido cargar los pueblos (${respuesta.status})`);
  }
  return validarCatalogo(await respuesta.json());
}
