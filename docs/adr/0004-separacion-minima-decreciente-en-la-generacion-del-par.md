# Los pares se generan con una separación mínima decreciente, no al azar

Con dos pueblos tapados, un par aleatorio produce rondas sin respuesta
averiguable: nadie sabe si una aldea de 312 habitantes tiene más que otra de
358, y acertar es suerte. Si eso pasa a menudo, la racha deja de medir
conocimiento. Por eso el generador exige que los dos valores del par estén
separados por una distancia mínima, y esa distancia se estrecha a medida que
crece la racha: las primeras rondas son holgadas y las últimas, apretadas.

A cambio, generar un par ya no es coger dos pueblos al azar, sino buscar dos
que cumplan una condición que depende del estado de la partida. La curva de
dificultad pasa a ser un parámetro afinable, no un efecto secundario.

La separación no se expresa igual en las tres métricas. En habitantes y
extensión es una proporción entre el valor mayor y el menor. En altitud es una
diferencia en metros, porque la proporción ahí engaña: dos pueblos a 2 m y a
6 m guardan la misma proporción que uno a 400 m y otro a 1.200 m, y el primer
par es una moneda al aire mientras el segundo es un cambio de paisaje. Los
valores concretos de la curva viven en un único fichero de parámetros, porque
solo se pueden afinar jugando.
