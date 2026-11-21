import { parse } from "csv-parse/sync";

/**
 * El padrón del INE trae el municipio como "01001 Alegría-Dulantzi" en una
 * sola columna, los habitantes con el punto de los miles, y filas de totales
 * mezcladas con los municipios. El código viaja siempre como texto: perder el
 * cero inicial dejaría fuera provincias enteras al cruzar las fuentes.
 */
export function leerPadron(csv: string): Map<string, number> {
  const filas: string[][] = parse(csv, { delimiter: ";", relaxColumnCount: true, from_line: 2 });
  const padron = new Map<string, number>();

  for (const fila of filas) {
    const municipio = fila[0]?.trim();
    const total = fila[fila.length - 1]?.trim();
    if (municipio === undefined || total === undefined) continue;

    const codigo = /^(\d{5})\s+\S/.exec(municipio)?.[1];
    if (codigo === undefined) continue;

    const habitantes = Number(total.replace(/[.\s]/g, ""));
    if (!Number.isInteger(habitantes)) continue;

    padron.set(codigo, habitantes);
  }

  return padron;
}
