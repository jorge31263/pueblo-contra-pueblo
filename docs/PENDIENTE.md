# Pendiente

Lo que las dos revisiones de rama encontraron y se decidió no arreglar todavía.
Ninguno rompe nada hoy; están aquí para que la decisión sea consciente y no un
olvido.

Los del juego y los del pipeline ya están arreglados. Lo que queda es la
infraestructura de publicación, donde dos de los tres no dependen de
nosotros, y la instalación.

## Infraestructura

- **`actions/checkout@v4` y `setup-node@v4` apuntan a Node 20**, que GitHub ha
  puesto en retirada: el runner las fuerza a Node 24 y lo avisa en cada
  ejecución. No rompe nada hoy; dejará de funcionar solo.
- **Tras un despliegue, quien ya había entrado puede ver la versión anterior
  hasta diez minutos.** GitHub Pages sirve `index.html` con
  `cache-control: max-age=600` y no deja cambiar esa cabecera. No tiene
  arreglo desde aquí: al comprobar un cambio recién desplegado, añade `?v=N` a
  la URL o no te fíes de lo que veas.
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
