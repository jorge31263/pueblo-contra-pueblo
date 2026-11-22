# Pueblo contra pueblo

Juego web de comparación entre pueblos españoles: el jugador ve dos pueblos y
una métrica, y elige cuál de los dos tiene el valor más alto. Encadenar
aciertos produce una racha, y la racha es lo que se presume y se reta.

## Language

### El catálogo

**Pueblo**:
Municipio español con menos de 20.000 habitantes.
_Avoid_: localidad, ciudad, villa, municipio (a secas), town

**Catálogo**:
El conjunto de pueblos que el juego puede llegar a mostrar: los que tienen
valor conocido en las tres métricas.
_Avoid_: base de datos, listado, pool

**Métrica**:
Magnitud de un pueblo sobre la que se puede comparar. Son tres: habitantes,
altitud en metros y extensión en kilómetros cuadrados.
_Avoid_: dato, estadística, categoría, atributo

### La partida

**Ronda**:
Una sola pregunta: un par de pueblos, una métrica, una elección.
_Avoid_: pregunta, turno, nivel

**Par**:
Los dos pueblos que se enfrentan en una ronda.
_Avoid_: pareja, enfrentamiento, duelo

**Separación**:
Lo lejos que están entre sí los dos valores de un par. El juego exige una
separación mínima para que la ronda sea una pregunta y no un azar, y la va
estrechando a medida que crece la racha.
_Avoid_: holgura, umbral, margen, dificultad, gap

**Partida**:
Secuencia de rondas que empieza en la primera y acaba en el primer fallo.
Agotar el tiempo de una ronda es un fallo como cualquier otro.
_Avoid_: juego, sesión, run

**Racha**:
Número de rondas acertadas consecutivas en una partida. Es la única cifra que
el juego mide.
_Avoid_: puntuación, puntos, score, marcador

**Semilla**:
Valor que determina por completo la secuencia de rondas de una partida: misma
semilla, mismos pares, mismas métricas, mismo orden.
_Avoid_: seed, clave, código de partida

### Los modos

**Reto diario**:
Partida cuya semilla es la fecha, de modo que todos los jugadores de ese día
se enfrentan a la misma secuencia y sus rachas son comparables.
_Avoid_: desafío diario, modo diario, daily

**Modo libre**:
Partida de semilla aleatoria, jugable tantas veces como se quiera.
_Avoid_: modo infinito, endless, práctica, entrenamiento
