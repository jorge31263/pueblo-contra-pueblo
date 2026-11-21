import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { leerPadron, leerNombres } from "./padron.js";
import { leerNomenclator } from "./nomenclator.js";
import { construirCatalogo, type MotivoDescarte } from "./catalogo.js";

/**
 * Pegamento de entrada y salida: lee los dos ficheros de data/raw/, construye
 * el catálogo y escribe el snapshot. La lógica está en los módulos, que sí
 * tienen pruebas; aquí viven las rutas, el informe y los cortafuegos que
 * impiden publicar un catálogo roto.
 */
const RUTAS = {
  padron: "data/raw/padron.csv",
  nomenclator: "data/raw/ngmep/MUNICIPIOS.csv",
  versiones: "data/raw/versiones.json",
  salida: "src/data/snapshot.json",
};

const MINIMO_PUEBLOS = 1000;
/** Un cruce sano entre padrón y Nomenclátor pasa del 98%. Por debajo, algo no cuadra. */
const CRUCE_MINIMO = 0.98;

function hoy(): string {
  // El día del proyecto es el peninsular (ADR 0007), no el UTC.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
}

function leerVersiones(): Record<string, string> {
  const versiones: Record<string, string> = JSON.parse(readFileSync(RUTAS.versiones, "utf8"));
  const vacias = ["padron", "ngmep"].filter((k) => !versiones[k]);
  if (vacias.length > 0) {
    throw new Error(`Falta la versión de ${vacias.join(", ")} en ${RUTAS.versiones}`);
  }
  return versiones;
}

function main(): void {
  const fuentes = leerVersiones();

  const csvPadron = readFileSync(RUTAS.padron, "utf8");
  const padron = leerPadron(csvPadron);
  const nombres = leerNombres(csvPadron);
  if (padron.size === 0) {
    throw new Error(`${RUTAS.padron} no ha dado ni un municipio: revisa el formato antes de seguir`);
  }

  // El Nomenclátor del IGN viene en ISO-8859-15, no en UTF-8.
  const nomenclator = leerNomenclator(readFileSync(RUTAS.nomenclator, "latin1"));

  console.log(`Padrón: ${padron.size} municipios`);
  console.log(`Nomenclátor: ${nomenclator.size} municipios con altitud y superficie`);

  // Un cruce bajo significa que los códigos de una fuente no son los que
  // creemos, no que falten datos. Y un excedente grande —códigos que el
  // Nomenclátor tiene y el padrón no— delata el mismo desajuste por el otro lado.
  const cruzan = [...padron.keys()].filter((id) => nomenclator.has(id)).length;
  const sobran = [...nomenclator.keys()].filter((id) => !padron.has(id)).length;
  const cruce = cruzan / padron.size;
  console.log(`  cruce: ${(cruce * 100).toFixed(1)}% (${sobran} códigos ajenos al padrón)`);
  if (cruce < CRUCE_MINIMO) {
    throw new Error(
      `Solo el ${(cruce * 100).toFixed(1)}% de los municipios del padrón aparece en el Nomenclátor: ` +
        `revisa los nombres de columna o el formato del código INE antes de seguir`,
    );
  }

  const { pueblos, descartes } = construirCatalogo({ padron, nombres, nomenclator });

  console.log(`\nCatálogo: ${pueblos.length} pueblos`);
  for (const motivo of Object.keys(descartes) as MotivoDescarte[]) {
    console.log(`  descartados por ${motivo}: ${descartes[motivo].length}`);
  }
  if (descartes["valor-imposible"].length > 0) {
    console.log(`  (valores imposibles: ${descartes["valor-imposible"].slice(0, 10).join(", ")})`);
  }

  if (pueblos.length < MINIMO_PUEBLOS) {
    throw new Error(`Solo ${pueblos.length} pueblos: algo ha fallado en el cruce, no escribo el snapshot`);
  }

  mkdirSync(dirname(RUTAS.salida), { recursive: true });
  writeFileSync(RUTAS.salida, JSON.stringify({ generadoEl: hoy(), fuentes, pueblos }) + "\n");
  console.log(`\nEscrito ${RUTAS.salida}`);
}

try {
  main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
