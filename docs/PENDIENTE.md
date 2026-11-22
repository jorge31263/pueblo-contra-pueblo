# Pendiente

Lo que las dos revisiones de rama encontraron y se decidió no arreglar todavía.
Ninguno rompe nada hoy; están aquí para que la decisión sea consciente y no un
olvido.

Los del juego y los del pipeline ya están arreglados. Lo que queda es la
instalación y la infraestructura de publicación, y dos de los tres de
infraestructura no dependen de nosotros.

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
