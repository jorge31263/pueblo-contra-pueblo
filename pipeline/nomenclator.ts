import { parse } from "csv-parse/sync";

/**
 * MUNICIPIOS.csv del Nomenclátor Geográfico del IGN: una fila por municipio
 * con su provincia, su altitud en metros y su superficie en hectáreas. Cubre
 * los 8.132 municipios, Canarias incluida, sin un solo hueco en esas dos
 * columnas (ver ADR 0008).
 *
 * El código de municipio son los cinco primeros dígitos de un COD_INE de once.
 * Se rellena con ceros antes de recortar: abierto como número pierde el cero
 * inicial de nueve provincias y "07001" se convertiría en "70010", un código
 * válido que no cruza con nada.
 *
 * El fichero viene en ISO-8859-15 y con la coma como separador decimal.
 *
 * La superficie se guarda con dos decimales, no con uno: Emperador (2,88 ha) y
 * Llocnou de la Corona (1,26 ha) son municipios reales que con un solo decimal
 * valdrían 0,0 km².
 */
const COLUMNAS = {
  codigo: "COD_INE",
  provincia: "PROVINCIA",
  altitud: "ALTITUD",
  superficie: "SUPERFICIE",
} as const;

const HECTAREAS_POR_KM2 = 100;

/** Por debajo de esto, unas cuantas filas raras son ruido y no un síntoma. */
const MINIMO_PARA_SOSPECHAR = 10;

export type FilaNomenclator = { provincia: string; altitud: number; extension: number };

function aNumero(bruto: string): number | undefined {
  if (bruto === "") return undefined;
  const numero = Number(bruto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : undefined;
}

export function leerNomenclator(csv: string): Map<string, FilaNomenclator> {
  const registros: Record<string, string>[] = parse(csv.replace(/^﻿/, ""), {
    delimiter: ";",
    columns: true,
    relaxColumnCount: true,
    skipEmptyLines: true,
  });

  const primera = registros[0];
  if (primera !== undefined) {
    const faltan = Object.values(COLUMNAS).filter((c) => !(c in primera));
    if (faltan.length > 0) {
      throw new Error(
        `El CSV del Nomenclátor no trae las columnas [${faltan.join(", ")}]: ` +
          `¿es MUNICIPIOS.csv? Cabeceras encontradas [${Object.keys(primera).join(", ")}]`,
      );
    }
  }

  const municipios = new Map<string, FilaNomenclator>();
  let sinDatos = 0;

  for (const registro of registros) {
    const digitos = registro[COLUMNAS.codigo]?.trim().replace(/\D/g, "");
    if (digitos === undefined || digitos.length === 0 || digitos.length > 11) continue;
    const codigo = digitos.padStart(11, "0").slice(0, 5);

    const altitud = aNumero(registro[COLUMNAS.altitud]?.trim() ?? "");
    const hectareas = aNumero(registro[COLUMNAS.superficie]?.trim() ?? "");
    const provincia = registro[COLUMNAS.provincia]?.trim();
    if (altitud === undefined || hectareas === undefined || !provincia) {
      sinDatos += 1;
      continue;
    }

    // MUNICIPIOS.csv trae una fila por municipio. Dos filas con el mismo
    // código significan que el fichero no es el que creemos, y quedarse con
    // la última en silencio es publicar la cifra equivocada.
    if (municipios.has(codigo)) {
      throw new Error(`El municipio ${codigo} aparece dos veces en el Nomenclátor`);
    }

    municipios.set(codigo, {
      provincia,
      altitud: Math.round(altitud),
      extension: Math.round((hectareas / HECTAREAS_POR_KM2) * 100) / 100,
    });
  }

  // Faltar la altitud de algún municipio suelto es normal; que falten en más
  // de la mitad significa que esas columnas no son las que creemos.
  if (sinDatos > MINIMO_PARA_SOSPECHAR && sinDatos > municipios.size) {
    throw new Error(
      `${sinDatos} filas del Nomenclátor no traen altitud, superficie o provincia ` +
        `frente a ${municipios.size} que sí: revisa las columnas ` +
        `"${COLUMNAS.altitud}" y "${COLUMNAS.superficie}"`,
    );
  }

  return municipios;
}
