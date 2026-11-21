---
status: accepted — sustituye al ADR 0005
---

# La extensión y la altitud salen del Nomenclátor del IGN

El ADR 0005 daba por hecho que el IGN solo publica la superficie oficial de
los municipios de más de 20.000 habitantes, y por eso mandaba calcular el área
de cada término desde los límites del CNIG. **La premisa era falsa.** El
`MUNICIPIOS.csv` del Nomenclátor Geográfico de Municipios y Entidades de
Población trae una fila por municipio con `ALTITUD` en metros y `SUPERFICIE`
en hectáreas, para los 8.132 municipios, Canarias incluida, sin un solo hueco
en esas dos columnas.

Así que el pipeline lee ese CSV y se acabó. Desaparecen la descarga de 157 MB
de los límites municipales, el recorrido del shapefile, la reproyección, el
cálculo de áreas geodésicas y las dependencias `shapefile`, `proj4` y
`@turf/area`. Desaparece también el problema de que Canarias se publique en
otra proyección, y con él la clase de fallo que más preocupaba: una proyección
mal aplicada que da cifras verosímiles y falsas. Ahora las cifras son las
oficiales del IGN, no unas calculadas por nosotros.

De paso, la provincia se toma de la columna `PROVINCIA` del mismo fichero, en
su forma oficial y bilingüe donde la tiene ("Araba/Álava",
"València/Valencia"), en lugar de una tabla propia de 52 entradas.
