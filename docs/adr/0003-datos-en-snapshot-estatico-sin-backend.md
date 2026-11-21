# Los datos viven en un snapshot estático y el juego no tiene backend

Las métricas cambian como mucho una vez al año (padrón) o nunca (altitud,
extensión). En lugar de consultar las APIs públicas en tiempo de juego, un
script genera un fichero de datos con el catálogo completo que se publica junto
a la web. Nada de latencia, de límites de uso ni de servidor que mantener: el
juego entero es una web estática.

La consecuencia aceptada es que no hay ranking global ni cuentas de usuario. La
comparación entre jugadores se apoya en el reto diario, cuya semilla es la
fecha, y en compartir la semilla de una partida del modo libre. Añadir un
ranking más adelante obligaría a introducir backend, cuentas y antitrampas en
un juego cuyas respuestas están a una búsqueda de distancia.
