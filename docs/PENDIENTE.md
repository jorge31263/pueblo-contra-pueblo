# Pendiente

Lo que las dos revisiones de rama encontraron y se decidió no arreglar todavía.
Ninguno rompe nada hoy; están aquí para que la decisión sea consciente y no un
olvido.

Los del juego y los del pipeline ya están arreglados. Lo que queda es de la
infraestructura de publicación, que no está en nuestra mano, y de la
instalación.

## Infraestructura

- **Tras un despliegue, quien ya había entrado puede ver la versión anterior
  hasta diez minutos.** GitHub Pages sirve `index.html` con
  `cache-control: max-age=600` y no deja cambiar esa cabecera. No tiene
  arreglo desde aquí: al comprobar un cambio recién desplegado, añade `?v=N` a
  la URL o no te fíes de lo que veas.

## Instalación

- **No hay recordatorio del reto diario.** Las notificaciones exigen permiso
  del usuario y, para que lleguen a su hora sin tener la web abierta, algo en
  un servidor: chocaría con el ADR 0003. Es una conversación aparte de la app.

## Decidido a conciencia que no

- **Bares como métrica.** No hay dato nacional fiable (ver la discusión en el
  historial y `docs/DESIGN.md`).
- **Ranking global.** Exigiría backend, cuentas y antitrampas en un juego cuyas
  respuestas están a una búsqueda de distancia (ADR 0003).
- **Mapas y fotos.** Regalan la altitud y la extensión (ADR 0006).
