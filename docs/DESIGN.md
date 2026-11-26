# Pueblo contra pueblo — diseño

Juego web de comparación entre pueblos españoles. Lee el
[glosario](../GLOSSARY.md) primero: los términos de este documento están
definidos allí, y los *por qué* están en [docs/adr](./adr).

## El juego

Una **ronda** muestra un **par** de pueblos y una **métrica** anunciada
("¿Cuál tiene más habitantes?"). Los dos valores están ocultos. El jugador
elige uno; se revelan los dos con un contador que sube.

- Acierto: la **racha** sube y la partida avanza sola a los 2 s.
- Fallo: la **partida** termina y aparece el resumen.

La métrica cambia de una ronda a otra, elegida por la semilla. De cada pueblo
se muestran solo **nombre y provincia** (ADR 0006).

### Métricas

| Métrica | Unidad mostrada | Fuente |
|---|---|---|
| Habitantes | número entero | Padrón continuo del INE (tabla 29005) |
| Altitud | metros | Nomenclátor Geográfico del IGN, `MUNICIPIOS.csv` |
| Extensión | km² | la misma fuente, convertida de hectáreas (ADR 0008) |

La extensión se guarda con dos decimales: con uno, Emperador (0,03 km²) y
Llocnou de la Corona (0,01 km²), los dos municipios más pequeños de España,
valdrían cero.

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

### El reloj

En el reto diario cada ronda dura **quince segundos**. Agotarlos cuenta como
fallo y termina la partida. El reloj se para en cuanto se elige: el revelado
no consume tiempo (ADR 0009).

El modo libre no lleva reloj.

### Modos

- **Reto diario**: la semilla es la fecha en hora peninsular (ADR 0007). Un
  intento por día, con reloj. Idéntico para todos los jugadores.
- **Modo libre**: semilla aleatoria, partidas ilimitadas, sin reloj. La semilla
  se puede compartir por enlace para que otra persona juegue la misma
  secuencia. Se puede dejar a medias, y la racha que llevaras cuenta: dejarlo
  no es fallar, y aquí no hay nada que falsear.

El reto diario no se puede dejar a medias. Poder abandonar la ronda que no te
sabes y empezar de nuevo convertiría el intento único en intentos infinitos.
Instalado en el móvil no hay botón de atrás del navegador, así que esa salida
es la única que hay.

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

## Dónde se juega

El juego es **una web**, y el móvil es su sitio principal: el reto diario se
juega de pie, en un minuto, probablemente en un teléfono. Todo lo que se
diseñe tiene que funcionar con el pulgar y sin teclado; el teclado es un extra
para quien juegue sentado.

Más adelante puede querer ser también **una app**, para que volver cada día
cueste un toque en lugar de buscar una URL. El camino natural es convertirla
en instalable (manifiesto, icono y caché propia) sin dejar de ser la misma web
estática: eso da icono en la pantalla de inicio y funcionamiento sin conexión
sin abrir la puerta a un backend ni a las tiendas de aplicaciones. Una app
nativa sería otra decisión y tendría su propio ADR.

Nada de esto está hecho todavía; queda escrito para que las decisiones de hoy
no lo impidan.

## Restricciones

- Web estática: sin servidor, sin cuentas, sin backend (ADR 0003).
- El móvil es el dispositivo principal: nada puede depender de ratón ni de
  teclado.
- Los datos viajan en un snapshot generado y versionado en el repo.
- Jugable entero con teclado; acierto y fallo nunca indicados solo por color.
- Ningún texto por debajo de 4,5:1 de contraste, en ninguna pantalla ni en
  ningún estado (ver *Contraste*).
- Todo el texto de cara al jugador, en castellano.
- La terminología del código sigue el glosario, incluidas sus listas `_Avoid_`.

## Contraste

**Ningún texto baja de 4,5:1 sobre su fondo.** Es el mínimo de la WCAG 2.1 nivel
AA para texto normal, aplicado también al texto grande, al que la norma le
permitiría 3:1 (ADR 0012). Un número de racha a 60 px con un gris flojo
cumpliría la norma y seguiría leyéndose mal al sol, que es donde se juega el
reto diario.

La regla salió de encontrarse con que no se cumplía: `text-slate-400` sobre
blanco da 2,56:1, y estaba en el pie con las fuentes, en el contador de
segundos, en el enlace de dejar la partida y en la × de cerrar un panel. El
gris secundario del juego es `slate-500` (4,76:1 sobre blanco), y los enlaces
secundarios oscurecen a `slate-900` al pasar por encima.

Hay un margen que conviene conocer antes de tocar nada: en la tarjeta del
ganador revelado la provincia es `slate-500` sobre `emerald-50`, y eso da
**4,52:1**. Son dos centésimas sobre el mínimo. Oscurecer ese fondo un solo
paso, a `emerald-100`, lo baja a 4,2:1 y lo incumple.

### Cómo se sujeta

Ninguna prueba de las que había veía esto, porque el color no está en el
comportamiento. Se vigila en dos capas, que cubren cosas distintas:

| Capa | Qué mira | Qué no alcanza |
|---|---|---|
| Detector en el CI | La página construida y servida, tal como carga | Cualquier estado al que se llegue pulsando o esperando |
| Pruebas de contraste | El DOM pintado de las tres pantallas, estado a estado | Lo que dependa de la hoja de estilos real |

El detector es `impeccable detect`, en el job `construir` de
`.github/workflows/publicar.yml`, antes de subir el artefacto: un fallo de
contraste no llega a desplegarse. Escanea el inicio y, por el hash
`#libre=...`, una ronda. La versión va fijada; sin fijar, una regla nueva aguas
arriba rompe una publicación sin que nadie haya tocado el juego.

Las pruebas viven en `src/pruebas/contraste.ts` y cubren lo que el detector no
carga: el aviso de reto ya jugado, los tres paneles abiertos, los valores
revelados, el reloj en rojo y el resumen entero, al que solo se llega jugando.

jsdom no carga la hoja de Tailwind, así que `getComputedStyle` no sabe de qué
color es nada. En vez de eso se leen las clases y se resuelven contra la paleta
de Tailwind, que es de donde salen los colores. El color y el fondo se heredan
del antepasado que los pone: por eso `text-white` dentro de `bg-slate-900` sale
bien y ese mismo blanco suelto sobre la página sale mal. Lo que lleva
`aria-hidden` no se mide, porque no se lee.

Consecuencia práctica: **un color nuevo se mide, no se elige a ojo**. Y una
prueba de contraste que nunca ha fallado no demuestra nada, así que al
escribirlas se comprueban al revés, estropeando el color a propósito y viendo
caer exactamente los casos que deben caer.

## El snapshot

Un único fichero JSON generado por el pipeline y consumido por el juego. Es la
frontera entre los dos subsistemas y lo único que comparten.

```json
{
  "generadoEl": "2026-11-21",
  "fuentes": { "padron": "2025", "ngmep": "2026-03" },
  "pueblos": [
    {
      "id": "50249",
      "nombre": "Tabuenca",
      "provincia": "Zaragoza",
      "habitantes": 305,
      "altitud": 770,
      "extension": 85.72
    }
  ]
}
```

- `id`: código INE de municipio, cinco dígitos, ceros iniciales incluidos.
- `altitud`: metros sobre el nivel del mar que el IGN da al municipio.
- `extension`: km² con dos decimales.
- `provincia`: en la forma oficial del IGN, bilingüe donde la tiene.
