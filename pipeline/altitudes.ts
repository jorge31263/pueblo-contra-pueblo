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

    // El código de entidad son diez dígitos: municipio (5) + entidad (5).
    // Abierto como número pierde el cero inicial de nueve provincias, y
    // recortar los cinco primeros de un código corto fabrica un municipio que
    // no existe. Rellenar antes de recortar lo devuelve a su sitio.
    const digitos = fila[COLUMNAS.codigo]?.trim().replace(/\D/g, "");
    if (digitos === undefined || digitos.length === 0 || digitos.length > 10) continue;
    const codigo = digitos.padStart(10, "0").slice(0, 5);

    const bruta = fila[COLUMNAS.altitud]?.trim();
    if (bruta === undefined || bruta === "") continue;

    const altitud = Number(bruta.replace(/[.\s]/g, ""));
    if (!Number.isInteger(altitud)) continue;

    altitudes.set(codigo, altitud);
  }

  return altitudes;
}
