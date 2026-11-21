# Ficheros de entrada

Dos descargas alimentan el snapshot. No se versionan: son grandes y cambian
una vez al año como mucho. Lo que sí se versiona es el snapshot resultante
(`src/data/snapshot.json`) y `versiones.json`, que dice de cuándo son.

## 1. Padrón → `data/raw/padron.csv`

Descarga directa, sin CAPTCHA:

    curl -o data/raw/padron.csv https://www.ine.es/jaxiT3/files/t/csv_bdsc/29005.csv

Son 26 MB y 732.000 filas: una por municipio, sexo y año desde 1996. El lector
se queda con el sexo "Total" del año más reciente. Es UTF-8 con BOM, aunque la
cabecera HTTP diga ISO-8859-15.

## 2. Nomenclátor del IGN → `data/raw/ngmep/MUNICIPIOS.csv`

Del [Centro de Descargas del CNIG](https://centrodedescargas.cnig.es/CentroDescargas/catalogo?Serie=NGMEN),
"Nomenclátor Geográfico de Municipios y Entidades de Población", 9,6 MB. La
descarga pasa por un reCAPTCHA, así que la hace una persona. Del ZIP
`BD_Municipios-Entidades.zip` solo hace falta `MUNICIPIOS.csv`:

    unzip -o ~/Downloads/BD_Municipios-Entidades.zip MUNICIPIOS.csv -d data/raw/ngmep/

Trae altitud y superficie de los 8.132 municipios. Viene en ISO-8859-15 y con
la coma como separador decimal.

**Los límites municipales del CNIG ya no hacen falta**: el ADR 0008 explica por
qué, y son 157 MB y un pipeline de geometría que nos ahorramos.

## Versiones

`data/raw/versiones.json` es lo que `main.ts` copia al campo `fuentes` del
snapshot. Edítalo al regenerar; si alguna queda vacía, la generación aborta.

## Atribución

El Nomenclátor es CC-BY 4.0 del IGN y obliga a citar la fuente donde se
publiquen los datos derivados:

> Obra derivada de NGMEP CC-BY 4.0 ign.es
