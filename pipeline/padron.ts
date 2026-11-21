import { parse } from "csv-parse/sync";

/**
 * El padrón del INE trae el municipio como "01001 Alegría-Dulantzi" en una
 * sola columna, los habitantes con el punto de los miles, y filas de totales
 * mezcladas con los municipios. El código viaja siempre como texto: perder el
 * cero inicial dejaría fuera provincias enteras al cruzar las fuentes.
 *
 * Es también la fuente de los nombres oficiales y la que define qué municipios
 * existen hoy, de ahí las dos lecturas sobre el mismo fichero.
 */
type FilaPadron = { codigo: string; nombre: string; habitantes: number };

function filasDelPadron(csv: string): FilaPadron[] {
  const filas: string[][] = parse(csv, { delimiter: ";", relaxColumnCount: true, from_line: 2 });
  const resultado: FilaPadron[] = [];

  for (const fila of filas) {
    const municipio = fila[0]?.trim();
    const total = fila[fila.length - 1]?.trim();
    if (municipio === undefined || total === undefined) continue;

    const partes = /^(\d{5})\s+(\S.*)$/.exec(municipio);
    if (partes === null) continue;

    const habitantes = Number(total.replace(/[.\s]/g, ""));
    if (!Number.isInteger(habitantes)) continue;

    resultado.push({ codigo: partes[1]!, nombre: partes[2]!.trim(), habitantes });
  }

  return resultado;
}

export function leerPadron(csv: string): Map<string, number> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.habitantes]));
}

export function leerNombres(csv: string): Map<string, string> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.nombre]));
}
