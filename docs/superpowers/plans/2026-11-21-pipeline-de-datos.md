# Pipeline de datos — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar `src/data/snapshot.json`, el catálogo de pueblos españoles con habitantes, altitud y extensión, a partir de las tres fuentes oficiales.

**Architecture:** Funciones puras por fuente (texto o fichero de entrada → `Map<codigoIne, valor>`), una función de fusión que construye el catálogo y rinde cuentas de lo que descarta, y un `main` fino que es el único que toca disco. Los ficheros de entrada se descargan a mano a `data/raw/` y no se versionan; el snapshot resultante sí. Ninguna prueba toca la red.

**Tech Stack:** Node 22, TypeScript, tsx, Vitest, `csv-parse`, `shapefile`, `proj4`, `@turf/area`.

**Spec:** [docs/DESIGN.md](../../DESIGN.md) · [GLOSSARY.md](../../../GLOSSARY.md) · [docs/adr](../../adr)

## Global Constraints

- El código INE de municipio es una cadena de **cinco dígitos con ceros iniciales**, nunca un número.
- El catálogo solo incluye municipios con **menos de 20.000 habitantes** y con valor conocido en las tres métricas.
- `extension` en km² redondeado a **un decimal**; `altitud` en metros enteros; `habitantes` entero.
- La terminología del código sigue [GLOSSARY.md](../../../GLOSSARY.md): `pueblo`, `catalogo`, `metrica`. No `town`, `pool`, `dataset`.
- Las funciones de lectura reciben **contenido ya leído** (string) o una ruta, nunca descargan nada.
- Toda la salida de consola, en castellano.

## Review Focus

1. **Código INE con el cero inicial perdido** ("01001" convertido a `1001` por un CSV o un `parseInt`): cruzaría mal las tres fuentes en silencio y dejaría fuera toda la provincia de Álava. Pinned en Tarea 2.
2. **Municipio presente en una fuente y ausente en otra** por fusión o segregación reciente: debe quedar descartado y contado en el informe, nunca producir un pueblo a medias ni romper la ejecución. Pinned en Tarea 5.
3. **Nombres oficiales con el artículo detrás** ("Coruña, A", "Cabrera, La", "Palmas de Gran Canaria, Las"): hay que darles la vuelta o el jugador lee algo que nadie dice en voz alta. Pinned en Tarea 1.
4. **Altitud 0, negativa o vacía**: hay municipios a nivel del mar y la celda vacía no es lo mismo que el cero. Pinned en Tarea 3.
5. **Municipios con varios polígonos** (islas, enclaves) y con zonas UTM distintas: el área es la suma de las partes, y una proyección mal aplicada da cifras verosímiles pero falsas. Pinned en Tarea 4.

---

### Tarea 1: Andamiaje y normalización de nombres

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `pipeline/nombres.ts`
- Test: `pipeline/nombres.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `normalizarNombre(oficial: string): string`

- [ ] **Step 1: Crear el andamiaje**

`package.json` con `type: "module"`, scripts `test` (vitest run) y `datos` (tsx pipeline/main.ts). `.gitignore` con `node_modules/` y `data/raw/`. TypeScript en modo `strict`.

- [ ] **Step 2: Escribir la prueba que falla**

```ts
describe("normalizarNombre", () => {
  it("da la vuelta al artículo pospuesto", () => {
    expect(normalizarNombre("Coruña, A")).toBe("A Coruña");
    expect(normalizarNombre("Cabrera, La")).toBe("La Cabrera");
    expect(normalizarNombre("Palmas de Gran Canaria, Las")).toBe("Las Palmas de Gran Canaria");
  });
  it("deja intactos los nombres sin artículo pospuesto", () => {
    expect(normalizarNombre("Tabuenca")).toBe("Tabuenca");
    expect(normalizarNombre("Arrasate/Mondragón")).toBe("Arrasate/Mondragón");
  });
  it("conserva las dos formas oficiales con artículo", () => {
    expect(normalizarNombre("Vall d'Uixó, la/Vall de Uxó, la")).toBe("la Vall d'Uixó/la Vall de Uxó");
  });
});
```

- [ ] **Step 3: Ejecutar y ver que falla**

Run: `npm test`
Expected: FAIL, `normalizarNombre is not defined`

- [ ] **Step 4: Implementar `normalizarNombre(oficial: string): string` en `pipeline/nombres.ts`**

Solo se mueve el artículo cuando el texto tras la coma final es exactamente uno de `el, la, los, las, a, as, o, os, es, l', s'` sin distinguir mayúsculas, y se conserva la capitalización original del artículo. Las dos formas oficiales van separadas por `/` y cada una se normaliza por su cuenta.

- [ ] **Step 5: Ejecutar y ver que pasa**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts .gitignore pipeline/nombres.ts pipeline/nombres.test.ts
git commit -m "feat(datos): andamiaje y normalizacion de nombres de municipio"
```

---

### Tarea 2: Provincias y lectura del padrón

**Files:**
- Create: `pipeline/provincias.ts`, `pipeline/padron.ts`
- Test: `pipeline/provincias.test.ts`, `pipeline/padron.test.ts`
- Create: `pipeline/fixtures/padron-min.csv`

**Interfaces:**
- Consumes: nada.
- Produces: `provinciaDe(id: string): string`, `leerPadron(csv: string): Map<string, number>`

- [ ] **Step 1: Escribir las pruebas que fallan**

```ts
describe("provinciaDe", () => {
  it("resuelve la provincia por los dos primeros dígitos", () => {
    expect(provinciaDe("01001")).toBe("Álava");
    expect(provinciaDe("50251")).toBe("Zaragoza");
    expect(provinciaDe("38023")).toBe("Santa Cruz de Tenerife");
  });
  it("rechaza un id que no sean cinco dígitos", () => {
    expect(() => provinciaDe("1001")).toThrow();
  });
});

describe("leerPadron", () => {
  it("conserva el cero inicial del código INE", () => {
    const m = leerPadron(fixture);
    expect([...m.keys()]).toContain("01001");
  });
  it("lee los habitantes como entero sin separador de miles", () => {
    expect(leerPadron(fixture).get("50251")).toBe(312);
    expect(leerPadron(fixture).get("28079")).toBe(3223334);
  });
  it("ignora las filas de totales nacionales y provinciales", () => {
    expect(leerPadron(fixture).has("TOTAL")).toBe(false);
    expect(leerPadron(fixture).size).toBe(4);
  });
});
```

El fixture es un CSV de cuatro municipios reales más una fila de total, con el separador y la codificación del fichero del INE (punto como separador de miles, `;` como delimitador).

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implementar `provinciaDe` y `leerPadron` en sus ficheros**

`provincias.ts` lleva la tabla de los 52 códigos como constante. `leerPadron` usa `csv-parse` en modo síncrono; la cifra de habitantes se limpia de puntos y espacios antes de convertirla, y el código se toma como texto tal cual aparece.

- [ ] **Step 4: Ejecutar y ver que pasan**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pipeline/provincias.ts pipeline/padron.ts pipeline/provincias.test.ts pipeline/padron.test.ts pipeline/fixtures/padron-min.csv
git commit -m "feat(datos): tabla de provincias y lectura del padron"
```

---

### Tarea 3: Altitudes del NGMEP

**Files:**
- Create: `pipeline/altitudes.ts`
- Test: `pipeline/altitudes.test.ts`
- Create: `pipeline/fixtures/ngmep-min.csv`

**Interfaces:**
- Consumes: nada.
- Produces: `leerAltitudes(csv: string): Map<string, number>`

- [ ] **Step 1: Escribir la prueba que falla**

```ts
describe("leerAltitudes", () => {
  it("toma la altitud del núcleo capital del municipio", () => {
    expect(leerAltitudes(fixture).get("50251")).toBe(629);
  });
  it("acepta la altitud cero", () => {
    expect(leerAltitudes(fixture).get("11004")).toBe(0);
  });
  it("omite el municipio cuando la altitud está vacía", () => {
    expect(leerAltitudes(fixture).has("07001")).toBe(false);
  });
  it("ignora los núcleos que no son la capital", () => {
    expect(leerAltitudes(fixture).get("33024")).toBe(232);
  });
});
```

El fixture incluye un municipio con varios núcleos de población para que la prueba del último caso signifique algo.

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implementar `leerAltitudes(csv: string): Map<string, number>` en `pipeline/altitudes.ts`**

Se queda solo con las filas cuyo tipo de entidad es la capital del municipio. Distinguir la celda vacía del cero: vacío se omite, `"0"` se queda.

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pipeline/altitudes.ts pipeline/altitudes.test.ts pipeline/fixtures/ngmep-min.csv
git commit -m "feat(datos): altitud del nucleo capital desde el NGMEP"
```

---

### Tarea 4: Áreas desde los límites del CNIG

**Files:**
- Create: `pipeline/areas.ts`
- Test: `pipeline/areas.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `areaKm2(geometria: Geometry): number`, `leerAreas(rutaShp: string): Promise<Map<string, number>>`

- [ ] **Step 1: Escribir las pruebas que fallan**

```ts
describe("areaKm2", () => {
  it("calcula el área de un polígono conocido con menos del 1% de error", () => {
    expect(areaKm2(cuadradoDeUnGrado)).toBeCloseTo(12308, -2);
  });
  it("suma todas las partes de un multipolígono", () => {
    expect(areaKm2(dosIslas)).toBeCloseTo(areaKm2(isla1) + areaKm2(isla2), 1);
  });
  it("descuenta los huecos interiores", () => {
    expect(areaKm2(poligonoConEnclave)).toBeLessThan(areaKm2(poligonoSinEnclave));
  });
});
```

Las geometrías del test son GeoJSON en WGS84 escritas a mano, con coordenadas en el documento de la prueba. No hace falta ningún shapefile para probar `areaKm2`.

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implementar `areaKm2` y `leerAreas`**

`areaKm2` delega en `@turf/area` (área geodésica en m²) y divide por 1e6 redondeando a un decimal. `leerAreas` abre el shapefile con `shapefile`, lee el CRS del `.prj` que lo acompaña y reproyecta cada geometría a WGS84 con `proj4` antes de medirla; el código INE sale del atributo del registro y se normaliza a cinco dígitos con ceros. Si el `.prj` no se reconoce, falla con un mensaje que diga qué CRS trae el fichero en lugar de medir mal.

- [ ] **Step 4: Ejecutar y ver que pasan**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pipeline/areas.ts pipeline/areas.test.ts
git commit -m "feat(datos): extension municipal calculada desde los limites del CNIG"
```

---

### Tarea 5: Construcción del catálogo

**Files:**
- Create: `pipeline/catalogo.ts`
- Test: `pipeline/catalogo.test.ts`

**Interfaces:**
- Consumes: `provinciaDe`, `normalizarNombre`.
- Produces: `construirCatalogo(entrada: EntradaCatalogo): ResultadoCatalogo`, y los tipos `Pueblo`, `EntradaCatalogo`, `ResultadoCatalogo`. `ResultadoCatalogo` es `{ pueblos: Pueblo[]; descartes: Record<MotivoDescarte, string[]> }` con `MotivoDescarte` = `"demasiado-grande" | "sin-habitantes" | "sin-altitud" | "sin-extension"`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```ts
describe("construirCatalogo", () => {
  it("incluye un municipio con las tres métricas y menos de 20.000 habitantes", () => { /* ... */ });
  it("descarta el municipio de 20.000 habitantes o más como demasiado-grande", () => { /* ... */ });
  it("descarta y anota el municipio que falta en una de las fuentes", () => {
    const r = construirCatalogo({ ...entrada, altitudes: new Map() });
    expect(r.pueblos).toHaveLength(0);
    expect(r.descartes["sin-altitud"]).toEqual(["50251"]);
  });
  it("no revienta cuando una fuente trae un municipio que las otras no conocen", () => { /* ... */ });
  it("normaliza el nombre y resuelve la provincia", () => {
    expect(construirCatalogo(entradaCoruna).pueblos[0]).toMatchObject({
      nombre: "A Coruña", provincia: "A Coruña",
    });
  });
  it("ordena el catálogo por código INE", () => { /* ... */ });
});
```

- [ ] **Step 2: Ejecutar y ver que fallan**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implementar `construirCatalogo` en `pipeline/catalogo.ts`**

Recorre los códigos del padrón, que es la única fuente que define qué municipios existen hoy, y para cada uno aplica el filtro de tamaño y la presencia de las tres métricas, anotando el primer motivo de descarte que encuentre. Función pura: no lee disco ni imprime.

- [ ] **Step 4: Ejecutar y ver que pasan**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pipeline/catalogo.ts pipeline/catalogo.test.ts
git commit -m "feat(datos): construccion del catalogo con informe de descartes"
```

---

### Tarea 6: Generación del snapshot

**Files:**
- Create: `pipeline/main.ts`, `data/raw/README.md`
- Modify: `package.json` (script `datos`)

**Interfaces:**
- Consumes: `leerPadron`, `leerAltitudes`, `leerAreas`, `construirCatalogo`.
- Produces: `src/data/snapshot.json` con la forma del spec, y un informe por consola.

- [ ] **Step 1: Escribir `data/raw/README.md`**

Qué fichero descargar de cada fuente, de qué página, con qué nombre guardarlo en `data/raw/` y de qué fecha es la versión usada para el snapshot que está en el repo. Es lo único que permite repetir la generación dentro de un año.

- [ ] **Step 2: Implementar `pipeline/main.ts`**

Lee los tres ficheros de `data/raw/`, llama a `construirCatalogo`, escribe `src/data/snapshot.json` con `generadoEl`, `fuentes` y `pueblos`, e imprime cuántos pueblos entran y cuántos se descartan por cada motivo. Si el catálogo sale con menos de 1.000 pueblos, aborta sin escribir: eso significa que un cruce ha fallado.

- [ ] **Step 3: Ejecutar sobre los datos reales**

Run: `npm run datos`
Expected: unos 7.500-7.900 pueblos y una lista de descartes que cuadre con el número de municipios de más de 20.000 habitantes (unos 400).

- [ ] **Step 4: Revisar diez pueblos a mano contra la Wikipedia**

Mirar la altitud y la extensión de diez pueblos conocidos. Un error sistemático de proyección se ve aquí y en ningún otro sitio. Si las cifras no cuadran, el bug está en la Tarea 4.

- [ ] **Step 5: Commit**

```bash
git add pipeline/main.ts data/raw/README.md package.json src/data/snapshot.json
git commit -m "feat(datos): generacion del snapshot del catalogo"
```
