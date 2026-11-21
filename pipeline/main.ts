import { readFileSync, writeFileSync } from "node:fs";
import { leerPadron, leerNombres } from "./padron.js";
import { leerAltitudes } from "./altitudes.js";
import { leerAreas } from "./areas.js";
import { construirCatalogo, type MotivoDescarte } from "./catalogo.js";

/**
 * Pegamento de entrada y salida: lee los tres ficheros de data/raw/, construye
 * el catálogo y escribe el snapshot. La lógica está en los módulos, que sí
 * tienen pruebas; aquí solo viven las rutas, el informe y los dos cortafuegos
 * que impiden publicar un catálogo roto.
 */
const RUTAS = {
  padron: "data/raw/padron.csv",
  ngmep: "data/raw/ngmep.csv",
  limites: "data/raw/municipios.shp",
  salida: "src/data/snapshot.json",
};

const CRS_LIMITES = process.env["CRS_LIMITES"] ?? "EPSG:25830";
const MINIMO_PUEBLOS = 1000;
const CRUCE_MINIMO = 0.5;

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const csvPadron = readFileSync(RUTAS.padron, "utf8");
  const padron = leerPadron(csvPadron);
  const nombres = leerNombres(csvPadron);
  const altitudes = leerAltitudes(readFileSync(RUTAS.ngmep, "utf8"));
  const areas = await leerAreas(RUTAS.limites, CRS_LIMITES);

  console.log(`Padrón: ${padron.size} municipios`);
  console.log(`Altitudes: ${altitudes.size} municipios`);
  console.log(`Extensiones: ${areas.size} municipios (${CRS_LIMITES})`);

  // Un cruce bajo significa que los códigos de una fuente no son los que
  // creemos, no que falten datos. Publicar eso sería publicar basura.
  for (const [fuente, mapa] of [["altitudes", altitudes], ["extensiones", areas]] as const) {
    const cruce = [...padron.keys()].filter((id) => mapa.has(id)).length / padron.size;
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

  if (pueblos.length < MINIMO_PUEBLOS) {
    throw new Error(`Solo ${pueblos.length} pueblos: algo ha fallado en el cruce, no escribo el snapshot`);
  }

  writeFileSync(
    RUTAS.salida,
    JSON.stringify({ generadoEl: hoy(), fuentes: { padron: "", ngmep: "", cnig: "" }, pueblos }, null, 0) + "\n",
  );
  console.log(`\nEscrito ${RUTAS.salida}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
