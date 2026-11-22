/*
 * Caché propia para que el juego se pueda jugar sin conexión una vez visitado.
 * Sube VERSION a mano cuando cambie el snapshot o quieras invalidar todo: al
 * activarse, el service worker borra cualquier caché que no sea la suya.
 */
const VERSION = "pcp-v2";
const BASICOS = [
  "./",
  "./index.html",
  "./snapshot.json",
  "./manifest.webmanifest",
  "./iconos/icono.svg",
  "./iconos/icono-180.png",
  "./iconos/icono-192.png",
  "./iconos/icono-512.png",
  "./iconos/mascara-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(BASICOS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET" || new URL(peticion.url).origin !== self.location.origin) return;

  // La página primero de la red: si no, un despliegue nuevo no se vería nunca.
  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(VERSION).then((cache) => cache.put("./index.html", copia));
          return respuesta;
        })
        .catch(() => caches.match("./index.html").then((r) => r ?? Response.error())),
    );
    return;
  }

  // Lo demás de la caché primero: los nombres de los ficheros llevan su hash,
  // así que un fichero cacheado nunca es una versión vieja de otra cosa.
  evento.respondWith(
    caches.match(peticion).then(
      (guardada) =>
        guardada ??
        fetch(peticion).then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(VERSION).then((cache) => cache.put(peticion, copia));
          }
          return respuesta;
        }),
    ),
  );
});
