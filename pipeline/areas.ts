import area from "@turf/area";
import proj4 from "proj4";
import { open } from "shapefile";
import type { Geometry, Polygon, MultiPolygon, Position } from "geojson";

/**
 * El IGN solo publica la superficie oficial de los municipios de más de 20.000
 * habitantes, justo los que el catálogo excluye (ver ADR 0005), así que la
 * extensión se calcula del polígono del término municipal.
 *
 * El CRS del fichero se pasa explícito en lugar de leerlo del .prj: traducir
 * WKT a un código EPSG exige una tabla de equivalencias que no tenemos, y
 * data/raw/README.md anota en qué proyección viene la descarga usada.
 */
const DEFINICIONES: Record<string, string> = {
  "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
  "EPSG:25828": "+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:25829": "+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:25830": "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:25831": "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  // Canarias se publica aparte y en REGCAN95, no en ETRS89.
  "EPSG:4082": "+proj=utm +zone=27 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:4083": "+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  "EPSG:4084": "+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};

/** Campos donde las descargas del CNIG guardan el código del municipio. */
const CAMPOS_CODIGO = ["CODIGOINE", "COD_INE", "CODINE", "NATCODE", "C_MUNI_IN"];

function areaM2(geometria: Polygon | MultiPolygon): number {
  return area({ type: "Feature", geometry: geometria, properties: {} });
}

export function areaKm2(geometria: Polygon | MultiPolygon): number {
  return Math.round((areaM2(geometria) / 1e6) * 10) / 10;
}

export function reproyectarAWgs84(geometria: Geometry, crs: string): Geometry {
  if (crs === "EPSG:4326") return geometria;

  const definicion = DEFINICIONES[crs];
  if (definicion === undefined) {
    throw new Error(`Proyección desconocida ${crs}: añádela a DEFINICIONES en pipeline/areas.ts`);
  }

  const convertir = (p: Position): Position => proj4(definicion, DEFINICIONES["EPSG:4326"]!, [p[0]!, p[1]!]);
  const anillos = (a: Position[]): Position[] => a.map(convertir);

  if (geometria.type === "Polygon") {
    return { type: "Polygon", coordinates: geometria.coordinates.map(anillos) };
  }
  if (geometria.type === "MultiPolygon") {
    return { type: "MultiPolygon", coordinates: geometria.coordinates.map((p) => p.map(anillos)) };
  }
  throw new Error(`Geometría no esperada en los límites municipales: ${geometria.type}`);
}

export function codigoIneDe(propiedades: Record<string, unknown>): string | undefined {
  for (const campo of CAMPOS_CODIGO) {
    const bruto = propiedades[campo];
    if (bruto === undefined || bruto === null) continue;

    const digitos = String(bruto).replace(/\D/g, "");

    // Un código de cinco dígitos o menos es el del municipio. El NATCODE del
    // CNIG son nueve: 34 (país) + 2 de comunidad + 2 de provincia + 3 de
    // municipio, así que los cinco últimos son el código INE. Cualquier otra
    // longitud es otro fichero (recintos provinciales, por ejemplo) y recortar
    // a ciegas daría un código de cinco dígitos válido y falso.
    if (digitos.length >= 4 && digitos.length <= 5) return digitos.padStart(5, "0");
    if (digitos.length === 9) return digitos.slice(-5);
    continue;
  }
  return undefined;
}

/**
 * Suma el área de todos los recintos de cada municipio: hay términos con islas
 * y con enclaves separados, y cada uno llega como un registro aparte.
 */
export async function leerAreas(rutaShp: string, crs: string): Promise<Map<string, number>> {
  const fuente = await open(rutaShp);
  const metrosCuadrados = new Map<string, number>();

  for (let registro = await fuente.read(); !registro.done; registro = await fuente.read()) {
    const rasgo = registro.value;
    if (rasgo.geometry === null) continue;

    const codigo = codigoIneDe(rasgo.properties ?? {});
    if (codigo === undefined) continue;

    const geometria = reproyectarAWgs84(rasgo.geometry as Geometry, crs) as Polygon | MultiPolygon;

    // Se acumula en metros cuadrados y se redondea una sola vez: redondear
    // cada recinto a un decimal antes de sumarlo hace desaparecer los islotes.
    metrosCuadrados.set(codigo, (metrosCuadrados.get(codigo) ?? 0) + areaM2(geometria));
  }

  return new Map(
    [...metrosCuadrados].map(([codigo, m2]) => [codigo, Math.round((m2 / 1e6) * 10) / 10]),
  );
}
