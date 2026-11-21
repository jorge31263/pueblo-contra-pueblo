import { normalizarNombre } from "./nombres.js";
import { provinciaDe } from "./provincias.js";

export type Pueblo = {
  id: string;
  nombre: string;
  provincia: string;
  habitantes: number;
  altitud: number;
  extension: number;
};

export type EntradaCatalogo = {
  padron: Map<string, number>;
  nombres: Map<string, string>;
  altitudes: Map<string, number>;
  areas: Map<string, number>;
};

export type MotivoDescarte =
  | "demasiado-grande"
  | "sin-nombre"
  | "sin-altitud"
  | "sin-extension"
  | "valor-imposible";

export type ResultadoCatalogo = {
  pueblos: Pueblo[];
  descartes: Record<MotivoDescarte, string[]>;
};

/** El corte del catálogo: menos de 20.000 habitantes (ADR 0002). */
export const LIMITE_HABITANTES = 20000;

/**
 * Rangos de lo que puede ser un municipio español. No son un capricho: una
 * proyección mal aplicada o un polígono degenerado no dan error, dan cifras
 * (ADR 0005). Esto convierte ese fallo mudo en una línea del informe.
 *
 * El municipio más extenso ronda los 1.750 km² (Cáceres) y el más pequeño no
 * llega a 0,1 km² (Emperador). La altitud admite valores algo negativos por
 * los municipios bajo el nivel del mar del litoral.
 */
export const RANGOS = {
  extension: { minimo: 0.1, maximo: 1800 },
  altitud: { minimo: -10, maximo: 2100 },
} as const;

/**
 * El padrón manda: es la única fuente que dice qué municipios existen hoy, así
 * que un código que solo aparece en el Nomenclátor o en los límites del CNIG
 * se ignora sin más (municipios fusionados o segregados). Todo municipio del
 * padrón que no llegue al catálogo queda anotado con su motivo.
 */
export function construirCatalogo(entrada: EntradaCatalogo): ResultadoCatalogo {
  const pueblos: Pueblo[] = [];
  const descartes: Record<MotivoDescarte, string[]> = {
    "demasiado-grande": [],
    "sin-nombre": [],
    "sin-altitud": [],
    "sin-extension": [],
    "valor-imposible": [],
  };

  for (const id of [...entrada.padron.keys()].sort()) {
    const habitantes = entrada.padron.get(id)!;

    if (habitantes >= LIMITE_HABITANTES) {
      descartes["demasiado-grande"].push(id);
      continue;
    }

    const nombre = entrada.nombres.get(id);
    if (nombre === undefined) {
      descartes["sin-nombre"].push(id);
      continue;
    }

    const altitud = entrada.altitudes.get(id);
    if (altitud === undefined) {
      descartes["sin-altitud"].push(id);
      continue;
    }

    const extension = entrada.areas.get(id);
    if (extension === undefined) {
      descartes["sin-extension"].push(id);
      continue;
    }

    if (
      extension < RANGOS.extension.minimo ||
      extension > RANGOS.extension.maximo ||
      altitud < RANGOS.altitud.minimo ||
      altitud > RANGOS.altitud.maximo
    ) {
      descartes["valor-imposible"].push(id);
      continue;
    }

    pueblos.push({
      id,
      nombre: normalizarNombre(nombre),
      provincia: provinciaDe(id),
      habitantes,
      altitud,
      extension,
    });
  }

  return { pueblos, descartes };
}
