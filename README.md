<img src="public/iconos/icono-192.png" width="96" alt="">

# Pueblo contra pueblo

Dos pueblos en pantalla y una pregunta: ¿cuál tiene más habitantes? ¿Cuál está a más altitud? ¿Cuál ocupa más? Aciertas y sigue otro par. Fallas y se acabó.

**[Jugar](https://jorge31263.github.io/pueblo-contra-pueblo/)**

Hay un reto diario, el mismo para todo el mundo, que sirve para picarse con quien quieras. Y un modo libre para jugar sin límite, con una semilla que puedes pasarle a otra persona para que le toquen exactamente tus mismas rondas.

Se instala en la pantalla de inicio del móvil y, una vez abierto, funciona sin conexión.

## Qué pueblos salen

Los 7.700 municipios españoles de menos de 20.000 habitantes. El corte deja fuera unos 430, entre ellos todas las capitales: con Madrid en el juego, media partida se resolvería sin pensar.

De cada pueblo se ve el nombre y la provincia. Nada más. Un mapa regalaría la altitud y media extensión.

Las rondas no son dos pueblos al azar. El generador exige que los dos valores estén lo bastante separados para que la pregunta se pueda razonar, y aprieta a medida que sube la racha: en la primera ronda el ganador saca al otro dos veces y media, en la decimoquinta basta con un 10%. Para la altitud la cuenta va en metros, porque un pueblo a 2 m y otro a 6 m guardan la misma proporción que 400 y 1.200 y no se parecen en nada.

## De dónde salen los datos

| Métrica | Fuente |
|---|---|
| Habitantes | Padrón municipal del INE, tabla 29005 |
| Altitud | Nomenclátor Geográfico de Municipios y Entidades de Población del IGN |
| Extensión | La misma fuente, convertida de hectáreas a km² |

Los dos ficheros se descargan a mano, se cruzan por código INE y salen 7.700 pueblos con las tres métricas completas. El proceso aborta si menos del 98% cruza, porque un cruce bajo no significa que falten datos: significa que los códigos de una fuente no son los que creemos.

Para regenerarlo, cuando el INE publique padrón nuevo:

```bash
npm run datos
```

Las instrucciones de descarga están en [data/raw/README.md](data/raw/README.md), con un aviso que conviene leer antes: hay que subir la versión de la caché o quien ya haya jugado seguirá viendo el catálogo viejo.

## Desarrollo

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

No hay servidor ni base de datos. El catálogo viaja como un JSON estático, las rachas se guardan en el navegador y cada despliegue es una carpeta de ficheros. Eso deja fuera el ranking global, que habría pedido cuentas de usuario y medidas antitrampa en un juego cuyas respuestas están a una búsqueda de Google.

## El repositorio por dentro

- [GLOSSARY.md](GLOSSARY.md): cómo se llama cada cosa, y qué palabras no usar.
- [docs/DESIGN.md](docs/DESIGN.md): las reglas del juego y la forma del catálogo.
- [docs/adr/](docs/adr): once decisiones con su porqué. La octava desmiente a la quinta.
- [docs/PENDIENTE.md](docs/PENDIENTE.md): lo que dos revisiones encontraron y se decidió dejar para luego.

## Fuentes y licencia

Obra derivada de NGMEP CC-BY 4.0 ign.es

Cifras de población del [INE](https://www.ine.es). Altitud y extensión del [Instituto Geográfico Nacional](https://www.ign.es).
