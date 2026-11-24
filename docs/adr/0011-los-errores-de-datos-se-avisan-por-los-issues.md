# Los errores en los datos se avisan por los issues de GitHub

## Estado

Aceptada

## Contexto

El juego enseña cifras de 7.700 municipios. Algunas estarán mal, y quien lo va
a notar no somos nosotros: es alguien de ese pueblo que sabe que su iglesia no
está a 300 m. Sin una forma de decirlo, ese error se queda ahí para siempre y
la persona se va con la idea de que el juego está mal hecho.

Un formulario de contacto pide servidor, y no hay (ADR 0003). Publicar una
dirección de correo significa publicar la personal del autor, que es la única
que existe; en una página abierta se rastrea y acaba recibiendo spam para
siempre, y una dirección publicada no se puede despublicar.

## Decisión

Los avisos van a los issues del repositorio, enlazados desde el panel "De dónde
salen los datos". No se publica ninguna dirección de correo.

## Consecuencias

No cuesta nada de mantener, el aviso queda público y cualquiera puede ver si ya
está reportado.

Pide cuenta de GitHub, así que la mayoría de los jugadores no lo va a usar: en
la práctica llegarán los avisos de gente técnica, y el resto se lo dirá al autor
por donde ya le escriba. Es el precio de no tener servidor ni dirección pública.
Si algún día los avisos importan más que eso, lo que cambia es la decisión 0003,
no esta.
