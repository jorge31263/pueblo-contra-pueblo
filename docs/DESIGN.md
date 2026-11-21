# Pueblo contra pueblo — diseño

Juego web de comparación entre pueblos españoles. Lee el
[glosario](../GLOSSARY.md) primero: los términos de este documento están
definidos allí, y los *por qué* están en [docs/adr](./adr).

## El juego

Una **ronda** muestra un **par** de pueblos y una **métrica** anunciada
("¿Cuál tiene más habitantes?"). Los dos valores están ocultos. El jugador
elige uno; se revelan los dos con un contador que sube.

- Acierto: la **racha** sube y la partida avanza sola a los 1,2 s.
- Fallo: la **partida** termina y aparece el resumen.

La métrica cambia de una ronda a otra, elegida por la semilla. De cada pueblo
se muestran solo **nombre y provincia** (ADR 0006).

### Métricas

| Métrica | Unidad mostrada | Fuente |
|---|---|---|
| Habitantes | número entero | Padrón continuo del INE |
| Altitud | metros | Nomenclátor Geográfico del IGN (NGMEP) |
| Extensión | km² con un decimal | área calculada de los límites del CNIG (ADR 0005) |

### Separación mínima

Un par solo es válido si sus dos valores están lo bastante separados, y la
exigencia se estrecha conforme crece la racha (ADR 0004). Primer tanteo, a
afinar jugando:

| Métrica | Medida | Racha 0 | Racha 15 o más |
|---|---|---|---|
| Habitantes | proporción mayor/menor | 2,5 | 1,10 |
| Extensión | proporción mayor/menor | 2,5 | 1,10 |
| Altitud | diferencia en metros | 400 | 40 |

Interpolación lineal entre la racha 0 y la racha 15; de 15 en adelante, el
valor final. Si tras un número acotado de intentos no aparece ningún par
válido, se relaja la exigencia en lugar de seguir buscando.

Los pares con valores iguales se descartan: una ronda sin respuesta correcta
no es una ronda. Un pueblo tampoco se repite en dos rondas consecutivas.

### Modos

- **Reto diario**: la semilla es la fecha en hora peninsular (ADR 0007). Un
  intento por día. Idéntico para todos los jugadores.
- **Modo libre**: semilla aleatoria, partidas ilimitadas. La semilla se puede
  compartir por enlace para que otra persona juegue la misma secuencia.

### Compartir

Texto plano, comparable y sin pistas: ni nombres de pueblos ni métricas.

```
Pueblo contra pueblo · 21 nov
Racha 14 🟩×14 🟥
¿Me ganas? <url>
```

### Catálogo

Municipios españoles de menos de 20.000 habitantes (ADR 0002) con valor
conocido en las tres métricas. Nombre en la forma oficial del INE, con las dos
formas cuando existen (Arrasate/Mondragón), y con el artículo delante y no
detrás: "A Coruña", no "Coruña, A".

### Fuera de la v1

Bares como métrica (no hay dato nacional fiable), ranking global (exigiría
backend, ADR 0003), mapas y fotos (ADR 0006), idiomas distintos del castellano.

## Restricciones

- Web estática: sin servidor, sin cuentas, sin backend (ADR 0003).
- Los datos viajan en un snapshot generado y versionado en el repo.
- Jugable entero con teclado; acierto y fallo nunca indicados solo por color.
- Todo el texto de cara al jugador, en castellano.
- La terminología del código sigue el glosario, incluidas sus listas `_Avoid_`.

## El snapshot

Un único fichero JSON generado por el pipeline y consumido por el juego. Es la
frontera entre los dos subsistemas y lo único que comparten.

```json
{
  "generadoEl": "2026-11-21",
  "fuentes": { "padron": "2025", "ngmep": "2025-06", "cnig": "2025-04" },
  "pueblos": [
    {
      "id": "50251",
      "nombre": "Tabuenca",
      "provincia": "Zaragoza",
      "habitantes": 312,
      "altitud": 629,
      "extension": 44.6
    }
  ]
}
```

- `id`: código INE de municipio, cinco dígitos, ceros iniciales incluidos.
- `altitud`: metros sobre el nivel del mar del núcleo capital del municipio.
- `extension`: km² con un decimal.
