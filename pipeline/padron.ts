import { parse } from "csv-parse/sync";

/**
 * El CSV del INE (tabla 29005) trae una fila por municipio, sexo y año desde
 * 1996: 732.000 filas para 8.138 municipios. De todas ellas solo interesan las
 * de sexo "Total" del año más reciente.
 *
 * Un municipio que no aparece en el año más reciente es un municipio que ya no
 * existe —fusionado o absorbido— y no entra en el catálogo con su última cifra
 * conocida.
 *
 * El municipio llega como "01001 Alegría-Dulantzi" en una sola columna, de la
 * que salen el código y el nombre oficial. El código viaja siempre como texto:
 * perder el cero inicial dejaría fuera provincias enteras al cruzar fuentes.
 * El fichero es UTF-8 con BOM, aunque su cabecera HTTP diga ISO-8859-15.
 */
const COLUMNAS = { municipio: "Municipios", sexo: "Sexo", periodo: "Periodo", total: "Total" } as const;
const SEXO_TOTAL = "Total";

/** Por debajo de esto, unas cuantas filas raras son ruido y no un síntoma. */
const MINIMO_PARA_SOSPECHAR = 10;

type FilaPadron = { codigo: string; nombre: string; habitantes: number };

function filasDelPadron(csv: string): FilaPadron[] {
  const registros: Record<string, string>[] = parse(csv.replace(/^﻿/, ""), {
    delimiter: ";",
    columns: true,
    relaxColumnCount: true,
    skipEmptyLines: true,
  });

  const primera = registros[0];
  if (primera !== undefined && !(COLUMNAS.total in primera)) {
    throw new Error(
      `El CSV del padrón no trae la columna "${COLUMNAS.total}": ` +
        `cabeceras encontradas [${Object.keys(primera).join(", ")}]`,
    );
  }

  const totales = registros.filter((r) => (r[COLUMNAS.sexo] ?? SEXO_TOTAL).trim() === SEXO_TOTAL);

  const periodos = totales.map((r) => r[COLUMNAS.periodo]?.trim()).filter((p): p is string => !!p);
  const ultimoPeriodo = periodos.length > 0 ? periodos.reduce((a, b) => (b > a ? b : a)) : undefined;

  const filas: FilaPadron[] = [];
  let sinCodigo = 0;
  let sinCifra = 0;
  for (const registro of totales) {
    const periodo = registro[COLUMNAS.periodo]?.trim();
    if (ultimoPeriodo !== undefined && periodo !== ultimoPeriodo) continue;

    const municipio = registro[COLUMNAS.municipio]?.trim();
    const total = registro[COLUMNAS.total]?.trim();
    if (municipio === undefined || total === undefined) continue;

    const partes = /^(\d{5})\s+(\S.*)$/.exec(municipio);
    if (partes === null) {
      sinCodigo += 1;
      continue;
    }

    // Number("") es 0, así que la celda vacía se colaría como un pueblo
    // fantasma de cero habitantes, y en el juego un cero rompe la proporción
    // de la separación mínima.
    if (total === "") continue;
    // El punto es el separador de miles y la coma el decimal, por si algún
    // día el INE publica la cifra con decimales.
    const habitantes = Math.round(Number(total.replace(/[.\s]/g, "").replace(",", ".")));
    // Ilegible no es lo mismo que implausible: un "no disponible" delata un
    // cambio de formato, y un cero es solo un municipio que no cuenta.
    if (!Number.isFinite(habitantes)) {
      sinCifra += 1;
      continue;
    }
    if (habitantes <= 0) continue;

    filas.push({ codigo: partes[1]!, nombre: partes[2]!.trim(), habitantes });
  }

  // Una cifra ilegible de vez en cuando es ruido; que haya más ilegibles que
  // buenas significa que la columna no es la que creemos.
  if (sinCifra > MINIMO_PARA_SOSPECHAR && sinCifra > filas.length) {
    throw new Error(
      `${sinCifra} filas del padrón traen una cifra de habitantes que no se puede leer ` +
        `frente a ${filas.length} que sí: revisa la columna "${COLUMNAS.total}"`,
    );
  }

  // Si el formato de la columna cambia, las filas caen en silencio y el cruce
  // con las otras fuentes sale impecable sobre un padrón mutilado.
  if (sinCodigo > MINIMO_PARA_SOSPECHAR && sinCodigo > filas.length) {
    throw new Error(
      `${sinCodigo} filas del padrón no traen un código de municipio reconocible ` +
        `frente a ${filas.length} que sí: ha cambiado el formato de la columna "${COLUMNAS.municipio}"`,
    );
  }

  return filas;
}

export function leerPadron(csv: string): Map<string, number> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.habitantes]));
}

export function leerNombres(csv: string): Map<string, string> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.nombre]));
}
