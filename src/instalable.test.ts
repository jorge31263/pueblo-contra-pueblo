import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const raiz = process.cwd();
const leer = (ruta: string) => readFileSync(resolve(raiz, ruta), "utf8");

describe("manifiesto", () => {
  const manifiesto = JSON.parse(leer("public/manifest.webmanifest"));

  it("se llama como el juego y cabe bajo un icono", () => {
    expect(manifiesto.name).toBe("Pueblo contra pueblo");
    expect(manifiesto.short_name.length).toBeLessThanOrEqual(12);
  });

  it("abre como aplicación y en castellano", () => {
    expect(manifiesto.display).toBe("standalone");
    expect(manifiesto.lang).toBe("es-ES");
  });

  it("usa rutas relativas, porque no vive en la raíz del dominio", () => {
    // En GitHub Pages el juego cuelga de /pueblo-contra-pueblo/.
    expect(manifiesto.start_url).toMatch(/^\.?\//);
    expect(manifiesto.scope).toMatch(/^\.?\//);
  });

  it("declara iconos de 192 y 512 que existen de verdad", () => {
    const tamanos = manifiesto.icons.map((i: { sizes: string }) => i.sizes);
    expect(tamanos).toContain("192x192");
    expect(tamanos).toContain("512x512");
    for (const icono of manifiesto.icons) {
      expect(existsSync(resolve(raiz, "public", icono.src.replace(/^\.?\//, "")))).toBe(true);
    }
  });

  it("trae un icono enmascarable, o Android lo recorta a lo bruto", () => {
    expect(manifiesto.icons.some((i: { purpose?: string }) => i.purpose?.includes("maskable"))).toBe(true);
  });
});

describe("index.html", () => {
  const html = leer("index.html");

  it("enlaza el manifiesto", () => {
    expect(html).toMatch(/<link[^>]+rel="manifest"[^>]+href="[^"]*manifest\.webmanifest"/);
  });

  it("trae el icono que usa iOS, que ignora el manifiesto", () => {
    expect(html).toMatch(/rel="apple-touch-icon"/);
  });

  it("tiñe la barra del sistema del color del juego", () => {
    expect(html).toMatch(/<meta[^>]+name="theme-color"[^>]+content="#0f172a"/);
  });
});

describe("service worker", () => {
  const sw = leer("public/sw.js");

  it("lleva una versión de caché que se pueda subir a mano", () => {
    expect(sw).toMatch(/const VERSION = "[^"]+"/);
  });

  it("guarda el catálogo para poder jugar sin conexión", () => {
    expect(sw).toContain("snapshot.json");
  });

  it("borra las cachés viejas al activarse", () => {
    expect(sw).toContain("caches.delete");
  });
});
