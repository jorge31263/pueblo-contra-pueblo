import { parse } from "csv-parse/sync";

/**
 * El Nomenclátor del IGN lista todas las entidades de población de cada
 * municipio, no solo una. La altitud de un pueblo es la de su núcleo capital
 * (ver docs/DESIGN.md), así que el resto de núcleos se ignoran.
 *
 * La celda vacía no es el cero: hay municipios a nivel del mar con altitud 0
 * y municipios sin altitud publicada, y confundirlos metería datos inventados
 * en el catálogo.
 *
 * COLUMNAS refleja la cabecera del fichero del NGMEP y es lo único que hay que
 * tocar si el IGN la cambia.
 */
const COLUMNAS = { codigo: "CODIGO_INE", tipo: "TIPO", altitud: "ALTITUD" } as const;
const TIPO_CAPITAL = "CAPITAL";

export function leerAltitudes(csv: string): Map<string, number> {
  const filas: Record<string, string>[] = parse(csv, {
    delimiter: ";",
    columns: true,
    relaxColumnCount: true,
  });
  const altitudes = new Map<string, number>();

  for (const fila of filas) {
    if (fila[COLUMNAS.tipo]?.trim().toUpperCase() !== TIPO_CAPITAL) continue;

    const codigo = fila[COLUMNAS.codigo]?.trim().slice(0, 5);
    if (codigo === undefined || !/^\d{5}$/.test(codigo)) continue;

    const bruta = fila[COLUMNAS.altitud]?.trim();
    if (bruta === undefined || bruta === "") continue;

    const altitud = Number(bruta.replace(/[.\s]/g, ""));
    if (!Number.isInteger(altitud)) continue;

    altitudes.set(codigo, altitud);
  }

  return altitudes;
}
