# Ficheros de entrada

Los tres ficheros que alimentan el snapshot se descargan a mano y **no se
versionan**: son grandes y cambian una vez al año como mucho. Lo que sí se
versiona es el snapshot resultante (`src/data/snapshot.json`).

Guarda cada descarga con el nombre exacto que espera `npm run datos`:

| Fichero esperado | Qué es | De dónde |
|---|---|---|
| `data/raw/padron.csv` | Cifras oficiales de población por municipio | INE, "Cifras oficiales de población de los municipios españoles: Revisión del Padrón Municipal". Descarga en CSV delimitado por `;` |
| `data/raw/ngmep.csv` | Entidades de población con su altitud | IGN, Nomenclátor Geográfico de Municipios y Entidades de Población (NGMEP), en el Centro de Descargas del CNIG |
| `data/raw/municipios.shp` | Recintos municipales de península y Baleares, con su `.dbf`, `.shx` y `.prj` al lado | CNIG, Base de Datos de Líneas Límite |
| `data/raw/municipios-canarias.shp` | Recintos municipales de Canarias, con sus ficheros al lado | CNIG, misma serie, descarga aparte |

## Las descargas del CNIG piden un CAPTCHA

El Centro de Descargas protege cada descarga con reCAPTCHA, así que estos dos
ficheros los baja una persona. El padrón del INE sí tiene descarga directa:

    curl -o data/raw/padron.csv https://www.ine.es/jaxiT3/files/t/csv_bdsc/29005.csv

## Proyección de los límites

España no cabe en una sola proyección: la península y Baleares van en **ETRS89
/ UTM 30N (EPSG:25830)** y Canarias en **REGCAN95 / UTM 28N (EPSG:4083)**. Por
eso `pipeline/main.ts` lee dos ficheros, cada uno con el suyo. Si olvidas el
segundo, las provincias 35 y 38 desaparecen del catálogo.

Mira el `.prj` de cada descarga: si no coincide, pásale el bueno por
`CRS_LIMITES` o `CRS_LIMITES_CANARIAS`, y si no está en `DEFINICIONES` (en
`pipeline/areas.ts`), añádelo allí. Si tu descarga resulta ser un único fichero
nacional, deja una sola entrada en la lista `LIMITES` de `main.ts`.

Una proyección equivocada no da error: da áreas verosímiles y falsas. Por eso
el último paso de la generación es comparar diez pueblos conocidos con la
Wikipedia.

## Versión usada en el snapshot del repo

Las versiones viven en `data/raw/versiones.json`, que sí está versionado y es
lo que `main.ts` copia al campo `fuentes` del snapshot. Edítalo al regenerar;
si alguna queda vacía, la generación aborta.

## Atribución

El NGMEP y los límites municipales son CC-BY 4.0 del IGN y obligan a citar la
fuente allá donde se publiquen los datos derivados:

> Obra derivada de NGMEP CC-BY 4.0 ign.es
