# Pendiente

Lo que las dos revisiones de rama encontraron y se decidió no arreglar todavía.
Ninguno rompe nada hoy; están aquí para que la decisión sea consciente y no un
olvido.

## Juego

- **El hash se compara sensible a mayúsculas.** `#LIBRE=abc123` cae al reto
  diario en silencio. Un enlace compartido que pase por un cliente que
  normalice el hash lleva a otra partida sin avisar.
- **"Volver al inicio" no limpia el hash.** Tras jugar `#libre=abc123`, recargar
  vuelve a entrar en esa misma semilla saltándose la pantalla de inicio.
- **Una pestaña abierta a medianoche sigue ofreciendo el reto de ayer.** La
  semilla del día se calcula al renderizar y nada vuelve a renderizar por el
  paso del tiempo.
- **Falta `<h1>` y `<main>`** en las pantallas de ronda y resumen; solo el
  inicio tiene encabezado de primer nivel.
- **Una mejor racha manipulada en `localStorage` se muestra tal cual**
  (`1e+21` pasa el `Number.isInteger`). Autoinfligido, pero un techo lo cierra.
- **Con racha ≥ 15, los dos escalones de relajación del generador son el mismo
  valor**, porque la separación exigida ya ha saturado. El escalón intermedio
  no existe justo donde más se necesitaría.
- **El último recurso del generador es determinista por métrica**: en un
  catálogo minúsculo, dos rondas seguidas con la misma métrica darían la misma
  ronda.
- **`key={version}` y `modoDesdeUrl` en cada render de `App` son trabajo
  muerto**, y el segundo engaña a quien lea el componente: no reacciona al
  hash.
- **`tsconfig` declara `vitest/globals` con `globals: false`.** Los globales
  tipan como disponibles pero no existen en ejecución.
- **El paquete se llama `pueblo-contra-pueblo-datos`**, nombre del pipeline,
  desde que los dos comparten un solo `package.json`.
- **`INTENTOS_POR_NIVEL` usa "nivel"**, que el glosario evita para *Ronda*.
  Aquí significa escalón de relajación; `INTENTOS_POR_ESCALON` lo cerraría.

## Pipeline

- **La coma decimal castellana se descarta en silencio** en el lector del
  padrón: `"1476,0"` da `NaN` y la fila desaparece sin dejar rastro.
- **Dos filas `CAPITAL` para el mismo municipio: gana la última**, sin aviso.
- **`provinciaDe` ya no existe**, pero si vuelve: abortaba el pipeline entero
  ante un prefijo de provincia desconocido en vez de generar un descarte.

## Infraestructura

- **`actions/checkout@v4` y `setup-node@v4` apuntan a Node 20**, que GitHub ha
  puesto en retirada: el runner las fuerza a Node 24 y lo avisa en cada
  ejecución. No rompe nada hoy; dejará de funcionar solo.
- **`deploy-pages` falla a veces con "Deployment failed, try again later"**, sin
  que haya cambiado nada. Es transitorio: reintentar el job basta.

## Decidido a conciencia que no

- **Bares como métrica.** No hay dato nacional fiable (ver la discusión en el
  historial y `docs/DESIGN.md`).
- **Ranking global.** Exigiría backend, cuentas y antitrampas en un juego cuyas
  respuestas están a una búsqueda de distancia (ADR 0003).
- **Mapas y fotos.** Regalan la altitud y la extensión (ADR 0006).
