# Las reglas se abren encima del juego, no en una página aparte

## Estado

Aceptada

## Contexto

Las reglas estaban escritas en `docs/DESIGN.md` y en el README, o sea, donde no
entra nadie que llegue al enlace del juego. Quien abría la web en frío no sabía
que hay tres métricas, que el reto diario es un intento al día, que las rondas
llevan reloj ni que los pares están elegidos para que la pregunta se pueda
razonar. Lo aprendía perdiendo, y perder la primera partida sin entender por qué
es la forma más barata de no volver.

Lo natural sería una página `/como-se-juega`. Hay dos razones para no hacerla.
GitHub Pages no tiene fallback de SPA: una ruta propia funciona al navegar pero
da 404 al recargarla o al compartirla, que es justo lo que haría alguien que
quiere explicarle el juego a otro. Y el juego no tiene enrutador; meterlo para
una pantalla de texto es traer una dependencia y un modo de fallo nuevos a
cambio de nada.

## Decisión

Las reglas viven en un panel que se abre encima del juego, con `role="dialog"`,
`aria-modal` y el tabulador atrapado dentro mientras está abierto. Se llega a él
desde la portada y desde la pantalla de fin de partida. No se abre solo, y no
está disponible durante una ronda: ahí corre el reloj y abrir un panel sería
regalar tiempo o quitarlo, según cómo se resolviera.

El texto no repite las cifras a mano. Los segundos por ronda y la curva de
exigencia salen de `src/dominio/parametros.ts`, los mismos valores que aplica el
generador, y hay tests que lo comprueban.

## Consecuencias

Quien afine la dificultad no tiene que acordarse de actualizar las reglas: el
texto le sigue. Si alguien cambia la redacción de forma que las cifras dejen de
aparecer, los tests fallan.

Las reglas no tienen dirección propia, así que no se pueden enlazar ni se
comparten sueltas. Para un texto que se lee una vez antes de la primera partida,
es un precio pequeño; si algún día hace falta enlazarlo, el hash ya se usa para
los modos y serviría también para esto.
