import { describe, it, expect } from "vitest";
import type { Polygon, MultiPolygon } from "geojson";
import { areaKm2, reproyectarAWgs84, codigoIneDe } from "./areas.js";

/** Cuadrado de un grado de lado con la esquina en (0,0). */
const cuadradoDeUnGrado: Polygon = {
  type: "Polygon",
  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
};

/**
 * Área del mismo cuadrado por la fórmula del exceso esférico, calculada aquí
 * aparte: R² · Δλ · (sen φ2 − sen φ1). Sirve de contraste independiente, para
 * que la prueba detecte que se está midiendo en grados cuadrados o en m² sin
 * convertir en lugar de sobre la esfera.
 */
const R_KM = 6371.0088;
const esperadaKm2 = R_KM ** 2 * (Math.PI / 180) * Math.sin((1 * Math.PI) / 180);

const isla = (desplazamiento: number): Polygon => ({
  type: "Polygon",
  coordinates: [[
    [desplazamiento, 0], [desplazamiento + 0.1, 0],
    [desplazamiento + 0.1, 0.1], [desplazamiento, 0.1],
    [desplazamiento, 0],
  ]],
});

const dosIslas: MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [isla(0).coordinates, isla(5).coordinates],
};

const conEnclave: Polygon = {
  type: "Polygon",
  coordinates: [
    cuadradoDeUnGrado.coordinates[0]!,
    [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6], [0.4, 0.4]],
  ],
};

describe("areaKm2", () => {
  it("mide sobre el elipsoide y no en grados cuadrados", () => {
    expect(areaKm2(cuadradoDeUnGrado)).toBeGreaterThan(esperadaKm2 * 0.99);
    expect(areaKm2(cuadradoDeUnGrado)).toBeLessThan(esperadaKm2 * 1.01);
  });

  it("suma todas las partes de un multipolígono", () => {
    // Cada parte se redondea a un decimal, así que la suma puede separarse
    // hasta 0,1 del total. Lo que la prueba descarta es medir una sola parte.
    expect(areaKm2(dosIslas)).toBeCloseTo(areaKm2(isla(0)) + areaKm2(isla(5)), 0);
    expect(areaKm2(dosIslas)).toBeGreaterThan(areaKm2(isla(0)) * 1.9);
  });

  it("descuenta los huecos interiores", () => {
    expect(areaKm2(conEnclave)).toBeLessThan(areaKm2(cuadradoDeUnGrado));
  });

  it("redondea a un decimal", () => {
    expect(areaKm2(cuadradoDeUnGrado).toString()).toMatch(/^\d+(\.\d)?$/);
  });
});

describe("reproyectarAWgs84", () => {
  it("convierte una coordenada UTM 30N conocida a longitud y latitud", () => {
    const geometria: Polygon = {
      type: "Polygon",
      coordinates: [[
        [500000, 4500000], [500100, 4500000],
        [500100, 4500100], [500000, 4500100],
        [500000, 4500000],
      ]],
    };
    const [lon, lat] = (reproyectarAWgs84(geometria, "EPSG:25830") as Polygon).coordinates[0]![0]!;
    expect(lon).toBeCloseTo(-3, 4);
    // Comprobado aparte con el arco de meridiano: para un northing de
    // 4.500.000 m y k0 = 0,9996 en la zona 30, la latitud es 40,6509.
    expect(lat).toBeCloseTo(40.6509, 3);
  });

  it("deja intacta una geometría que ya está en WGS84", () => {
    expect(reproyectarAWgs84(cuadradoDeUnGrado, "EPSG:4326")).toEqual(cuadradoDeUnGrado);
  });

  it("falla con un CRS que no conoce, en lugar de medir mal", () => {
    expect(() => reproyectarAWgs84(cuadradoDeUnGrado, "EPSG:9999")).toThrow(/EPSG:9999/);
  });
});

describe("codigoIneDe", () => {
  it("rellena con ceros a la izquierda hasta cinco dígitos", () => {
    expect(codigoIneDe({ NATCODE: "1001" })).toBe("01001");
    expect(codigoIneDe({ CODIGOINE: "50249" })).toBe("50249");
  });

  it("toma los cinco últimos dígitos de un NATCODE de nueve dígitos", () => {
    expect(codigoIneDe({ NATCODE: "340250249" })).toBe("50249");
  });

  it("devuelve undefined cuando el registro no trae código", () => {
    expect(codigoIneDe({ NOMBRE: "Tabuenca" })).toBeUndefined();
  });
});

describe("reproyectarAWgs84: Canarias", () => {
  it("conoce REGCAN95 / UTM 28N, la proyección de los recintos canarios", () => {
    const g: Polygon = { type: "Polygon", coordinates: [[[400000, 3100000], [400100, 3100000], [400100, 3100100], [400000, 3100100], [400000, 3100000]]] };
    const [lon, lat] = (reproyectarAWgs84(g, "EPSG:4084") as Polygon).coordinates[0]![0]!;
    expect(lon).toBeGreaterThan(-19);
    expect(lon).toBeLessThan(-13);
    expect(lat).toBeGreaterThan(27);
    expect(lat).toBeLessThan(29.5);
  });
});
