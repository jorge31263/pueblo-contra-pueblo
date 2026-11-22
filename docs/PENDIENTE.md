# Pendiente

Lo que las dos revisiones de rama encontraron y se decidió no arreglar todavía.
Ninguno rompe nada hoy; están aquí para que la decisión sea consciente y no un
olvido.

Los del juego ya están arreglados. Lo que queda toca el pipeline, que solo se
ejecuta una vez al año, y la infraestructura de publicación.

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

## Instalación

- **El icono de la app no se cachea.** No hace falta para jugar, pero la
  pantalla de inicio podría quedarse sin él la primera vez sin conexión.
- **No hay recordatorio del reto diario.** Las notificaciones exigen permiso
  del usuario y, para que lleguen a su hora sin tener la web abierta, algo en
  un servidor: chocaría con el ADR 0003. Es una conversación aparte de la app.

## Decidido a conciencia que no

- **Bares como métrica.** No hay dato nacional fiable (ver la discusión en el
  historial y `docs/DESIGN.md`).
- **Ranking global.** Exigiría backend, cuentas y antitrampas en un juego cuyas
  respuestas están a una búsqueda de distancia (ADR 0003).
- **Mapas y fotos.** Regalan la altitud y la extensión (ADR 0006).
