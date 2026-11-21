# Ficheros de entrada

Los tres ficheros que alimentan el snapshot se descargan a mano y **no se
versionan**: son grandes y cambian una vez al año como mucho. Lo que sí se
versiona es el snapshot resultante (`src/data/snapshot.json`).

Guarda cada descarga con el nombre exacto que espera `npm run datos`:

| Fichero esperado | Qué es | De dónde |
|---|---|---|
| `data/raw/padron.csv` | Cifras oficiales de población por municipio | INE, "Cifras oficiales de población de los municipios españoles: Revisión del Padrón Municipal". Descarga en CSV delimitado por `;` |
| `data/raw/ngmep.csv` | Entidades de población con su altitud | IGN, Nomenclátor Geográfico de Municipios y Entidades de Población (NGMEP), en el Centro de Descargas del CNIG |
| `data/raw/municipios.shp` | Límites municipales, con su `.dbf`, `.shx` y `.prj` al lado | CNIG, Base de Datos de Líneas Límite / recintos municipales |

## Proyección de los límites

`npm run datos` asume que el shapefile viene en **ETRS89 / UTM 30N
(EPSG:25830)**. Mira el `.prj` que acompaña a la descarga: si no es ese,
pásale el bueno por la variable de entorno `CRS_LIMITES`, y si no está en
`DEFINICIONES` (en `pipeline/areas.ts`), añádelo allí.

Una proyección equivocada no da error: da áreas verosímiles y falsas. Por eso
el último paso de la generación es comparar diez pueblos conocidos con la
Wikipedia.

## Versión usada en el snapshot del repo

Anota aquí la fecha de cada descarga cuando regeneres el snapshot, y refléjala
en el campo `fuentes` del propio fichero.

- Padrón: *pendiente*
- NGMEP: *pendiente*
- Límites CNIG: *pendiente*
