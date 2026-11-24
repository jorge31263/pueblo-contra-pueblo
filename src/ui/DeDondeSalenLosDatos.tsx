import { Panel } from "./Panel.js";
import type { Fuentes } from "../catalogo.js";

const AVISOS = "https://github.com/jorge31263/pueblo-contra-pueblo/issues";

const MES_Y_ANO = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const DIA_COMPLETO = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Las fechas salen del snapshot, y si no vienen o vienen rotas no se enseña
 * ninguna. Una fecha inventada es peor que ninguna: quien la lee se fía.
 * En UTC a propósito, que si no "2026-11-22" se vuelve el 21 en media Europa.
 */
function comoFecha(iso: string | undefined): Date | undefined {
  if (iso === undefined) return undefined;
  const completo = /^\d{4}-\d{2}$/.test(iso) ? `${iso}-01` : iso;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completo)) return undefined;
  const fecha = new Date(`${completo}T00:00:00Z`);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}

export function DeDondeSalenLosDatos({ fuentes }: { fuentes: Fuentes }) {
  const edicion = comoFecha(fuentes.ngmep);
  const generado = comoFecha(fuentes.generadoEl);

  return (
    <Panel etiqueta="De dónde salen los datos" titulo="De dónde salen los datos">
      <p>
        Los habitantes son los del padrón municipal del{" "}
        <a href="https://www.ine.es" className="underline" target="_blank" rel="noopener noreferrer">
          INE
        </a>
        , tabla 29005{fuentes.padron !== undefined && `, cifras de ${fuentes.padron}`}.
      </p>
      <p>
        La altitud y la extensión son del Nomenclátor Geográfico de Municipios y Entidades de
        Población del{" "}
        <a href="https://www.ign.es" className="underline" target="_blank" rel="noopener noreferrer">
          IGN
        </a>
        {edicion !== undefined && `, edición de ${MES_Y_ANO.format(edicion)}`}. La extensión viene
        en hectáreas y aquí se pasa a kilómetros cuadrados.
      </p>
      {generado !== undefined && (
        <p>
          El catálogo del juego se generó el {DIA_COMPLETO.format(generado)}. Hasta que no se
          vuelva a generar, las cifras son las de ese día aunque las fuentes publiquen otras.
        </p>
      )}
      <p>
        Son las cifras oficiales, que no es lo mismo que exactas. La altitud de un municipio se
        mide en un punto concreto y no en todo el término, y un padrón es la foto de un día. Para
        jugar valen; para cualquier cosa seria, ve a la fuente.
      </p>
      <p>
        ¿Has visto un pueblo con una cifra que no te cuadra?{" "}
        <a href={AVISOS} className="underline" target="_blank" rel="noopener noreferrer">
          Cuéntamelo aquí
        </a>
        . Si el error es nuestro se arregla, y si viene de la fuente al menos queda apuntado.
      </p>
    </Panel>
  );
}
