# El contraste mínimo es 4,5:1, también en el texto grande

El gris de los textos menores llevaba desde el principio por debajo del mínimo
de accesibilidad y nadie se había dado cuenta: `text-slate-400` sobre blanco da
2,56:1, donde la WCAG 2.1 nivel AA pide 4,5:1. Estaba en el pie con las
fuentes, en el contador de segundos de la ronda, en el enlace de dejar la
partida y en la × de cerrar un panel. Ninguna de las 239 pruebas que había lo
vio, porque ninguna miraba colores: el contraste no está en el comportamiento,
y es lo único de la interfaz que no se puede comprobar leyendo el código.

Lo encontró un escáner de interfaz pasado contra el juego servido. Esa es la
parte que importa de la anécdota: hizo falta una página pintada. Las reglas de
contraste necesitan saber de qué color acaba siendo cada texto, y eso no se
sabe hasta que la hoja de estilos se aplica.

## El mínimo

La norma permite bajar a 3:1 cuando el texto es grande —24 px, o 18,66 px en
negrita—. Aquí no se usa esa excepción: **4,5:1 para todo**.

El motivo es dónde se juega. El reto diario se juega de pie y en un minuto,
probablemente en la calle y con el brillo del móvil peleándose con el sol. Un
número de racha a 60 px en un gris flojo cumpliría la norma y seguiría sin
leerse. La excepción de la norma está pensada para titulares que se leen una
vez, no para la cifra que es el resultado entero de la partida.

El precio es real y conviene decirlo: un gris claro deliberado en un titular
grande queda prohibido aunque sea legal. Se aceptó porque hoy no hay ninguno y
porque la alternativa —decidir caso por caso si un texto cuenta como grande—
es justo el tipo de criterio que nadie aplica dos veces igual.

## Dos capas, porque ninguna llega sola

Se descartó vigilarlo en un solo sitio.

Solo con el escáner en la publicación: carga URLs, y a la mitad de la interfaz
no se llega por URL. El resumen solo aparece después de fallar una ronda, y el
reloj en rojo, los valores revelados y los paneles abiertos exigen pulsar o
esperar. Habría dado por buena una pantalla entera sin mirarla.

Solo con pruebas: jsdom no carga la hoja de Tailwind, así que `getComputedStyle`
devuelve vacío y no hay nada que medir. La salida es leer las clases del DOM
pintado y resolverlas contra la paleta de Tailwind, que es de donde salen los
colores de verdad. Funciona, pero mide lo que las clases *dicen*, no lo que el
navegador *pinta*: un estilo suelto, una variable CSS o una regla de la hoja se
le escapan.

Las dos capas tapan agujeros distintos, así que están las dos. El escáner corre
en el CI antes de subir el artefacto, de modo que un fallo de contraste no
llega a desplegarse; las pruebas corren antes, en cada `npm test`, y cubren los
estados a los que solo se llega jugando.

## Consecuencias

Un color nuevo se mide, no se elige a ojo. Y queda sujeto un margen que nadie
habría visto: la provincia del pueblo ganador, una vez revelado, es `slate-500`
sobre `emerald-50` y da 4,52:1. Dos centésimas. Oscurecer ese fondo un solo
paso lo incumple, y ahora eso rompe una prueba en vez de llegar a producción.

La versión del escáner va fijada en el workflow. Es una herramienta joven y que
publica a diario: sin fijar, una regla nueva aguas arriba tumbaría una
publicación sin que nadie hubiera tocado el juego.

Queda fuera el resto de la accesibilidad del color. Esto mide texto sobre
fondo, y no dice nada de bordes, focos ni iconos; que acierto y fallo no se
indiquen solo por color sigue siendo una restricción aparte, sostenida por las
pruebas de cada pantalla.
