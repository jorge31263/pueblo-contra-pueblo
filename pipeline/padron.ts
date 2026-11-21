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

type FilaPadron = { codigo: string; nombre: string; habitantes: number };

function filasDelPadron(csv: string): FilaPadron[] {
  const registros: Record<string, string>[] = parse(csv.replace(/^﻿/, ""), {
    delimiter: ";",
    columns: true,
    relaxColumnCount: true,
    skipEmptyLines: true,
  });

  const totales = registros.filter((r) => (r[COLUMNAS.sexo] ?? SEXO_TOTAL).trim() === SEXO_TOTAL);

  const periodos = totales.map((r) => r[COLUMNAS.periodo]?.trim()).filter((p): p is string => !!p);
  const ultimoPeriodo = periodos.length > 0 ? periodos.reduce((a, b) => (b > a ? b : a)) : undefined;

  const filas: FilaPadron[] = [];
  for (const registro of totales) {
    const periodo = registro[COLUMNAS.periodo]?.trim();
    if (ultimoPeriodo !== undefined && periodo !== ultimoPeriodo) continue;

    const municipio = registro[COLUMNAS.municipio]?.trim();
    const total = registro[COLUMNAS.total]?.trim();
    if (municipio === undefined || total === undefined) continue;

    const partes = /^(\d{5})\s+(\S.*)$/.exec(municipio);
    if (partes === null) continue;

    const habitantes = Number(total.replace(/[.\s]/g, ""));
    if (!Number.isInteger(habitantes)) continue;

    filas.push({ codigo: partes[1]!, nombre: partes[2]!.trim(), habitantes });
  }

  return filas;
}

export function leerPadron(csv: string): Map<string, number> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.habitantes]));
}

export function leerNombres(csv: string): Map<string, string> {
  return new Map(filasDelPadron(csv).map((f) => [f.codigo, f.nombre]));
}
