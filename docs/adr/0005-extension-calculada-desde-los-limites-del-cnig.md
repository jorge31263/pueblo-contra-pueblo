---
status: superseded by ADR-0008
---

# La extensión se calcula a partir de los límites municipales del CNIG

El IGN publica la superficie oficial de comunidades, provincias y municipios de
más de 20.000 habitantes: justamente los que el catálogo excluye. El Anuario
Estadístico del Ministerio de Agricultura da extensión por término municipal,
pero en PDF. No existe un fichero tabular nacional de superficie municipal
listo para usar.

Así que el script que genera el snapshot descarga los límites municipales del
CNIG y calcula el área de cada término. Se descartó Wikidata, que habría dado
las tres métricas en una sola consulta SPARQL, porque su procedencia es
desigual y una cifra equivocada en la métrica donde el jugador tiene menos
intuición rompe la ronda sin que pueda darse cuenta. El coste es meter
geometría en el pipeline de datos, para un script que corre una vez al año.

**Sustituido por el [ADR 0008](./0008-extension-y-altitud-del-nomenclator-del-ign.md).**
La premisa de partida era falsa: el Nomenclátor del IGN sí publica la
superficie de todos los municipios.
