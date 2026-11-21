import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { leerPadron, leerNombres } from "./padron.js";
import { leerAltitudes } from "./altitudes.js";
import { leerAreas } from "./areas.js";
import { construirCatalogo, type MotivoDescarte } from "./catalogo.js";

/**
 * Pegamento de entrada y salida: lee los ficheros de data/raw/, construye el
 * catálogo y escribe el snapshot. La lógica está en los módulos, que sí tienen
 * pruebas; aquí viven las rutas, el informe y los cortafuegos que impiden
 * publicar un catálogo roto.
 */
const RUTAS = {
  padron: "data/raw/padron.csv",
  ngmep: "data/raw/ngmep.csv",
  versiones: "data/raw/versiones.json",
  salida: "src/data/snapshot.json",
};

/**
 * El CNIG no publica los recintos municipales de toda España en un fichero:
 * la península y Baleares van en ETRS89 y Canarias en REGCAN95, que son
 * proyecciones distintas. Con una sola entrada, Canarias entera —las
 * provincias 35 y 38— desaparecería del catálogo sin hacer ruido.
 *
 * Si tu descarga es un único fichero nacional, deja una sola entrada.
 */
const LIMITES: { ruta: string; crs: string }[] = [
  { ruta: "data/raw/municipios.shp", crs: process.env["CRS_LIMITES"] ?? "EPSG:25830" },
  { ruta: "data/raw/municipios-canarias.shp", crs: process.env["CRS_LIMITES_CANARIAS"] ?? "EPSG:4083" },
];

const MINIMO_PUEBLOS = 1000;
/** Un cruce sano con estas fuentes pasa del 98%. Por debajo, algo no cuadra. */
const CRUCE_MINIMO = 0.98;

function hoy(): string {
  // El día del proyecto es el peninsular (ADR 0007), no el UTC.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
}

function leerVersiones(): Record<string, string> {
  const versiones: Record<string, string> = JSON.parse(readFileSync(RUTAS.versiones, "utf8"));
  const vacias = ["padron", "ngmep", "cnig"].filter((k) => !versiones[k]);
  if (vacias.length > 0) {
    throw new Error(`Falta la versión de ${vacias.join(", ")} en ${RUTAS.versiones}`);
  }
  return versiones;
}

async function main(): Promise<void> {
  const fuentes = leerVersiones();

  const csvPadron = readFileSync(RUTAS.padron, "utf8");
  const padron = leerPadron(csvPadron);
  const nombres = leerNombres(csvPadron);
  if (padron.size === 0) {
    throw new Error(`${RUTAS.padron} no ha dado ni un municipio: revisa el formato antes de seguir`);
  }
  const altitudes = leerAltitudes(readFileSync(RUTAS.ngmep, "utf8"));

  const areas = new Map<string, number>();
  for (const { ruta, crs } of LIMITES) {
    if (!existsSync(ruta)) {
      throw new Error(`Falta ${ruta}: sin ese fichero quedarían provincias enteras fuera del catálogo`);
    }
    for (const [codigo, km2] of await leerAreas(ruta, crs)) areas.set(codigo, km2);
    console.log(`Extensiones de ${ruta} (${crs}): ${areas.size} municipios acumulados`);
  }

  console.log(`Padrón: ${padron.size} municipios`);
  console.log(`Altitudes: ${altitudes.size} municipios`);

  // Un cruce bajo significa que los códigos de una fuente no son los que
  // creemos, no que falten datos. Y un excedente grande —códigos que ninguna
  // fuente comparte con el padrón— delata el mismo desajuste por el otro lado.
  for (const [fuente, mapa] of [["altitudes", altitudes], ["extensiones", areas]] as const) {
    const cruzan = [...padron.keys()].filter((id) => mapa.has(id)).length;
    const sobran = [...mapa.keys()].filter((id) => !padron.has(id)).length;
    const cruce = cruzan / padron.size;
    console.log(`  cruce con ${fuente}: ${(cruce * 100).toFixed(1)}% (${sobran} códigos ajenos al padrón)`);
    if (cruce < CRUCE_MINIMO) {
      throw new Error(
        `Solo el ${(cruce * 100).toFixed(1)}% de los municipios del padrón aparece en ${fuente}: ` +
          `revisa los nombres de columna o el campo del código INE antes de seguir`,
      );
    }
  }

  const { pueblos, descartes } = construirCatalogo({ padron, nombres, altitudes, areas });

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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
