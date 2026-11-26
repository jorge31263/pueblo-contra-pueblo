import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * El índice de ADR de DESIGN.md se mantiene a mano, y una lista a mano se
 * queda corta en cuanto alguien añade una decisión y se olvida de apuntarla.
 * Un índice incompleto es peor que no tenerlo: quien lo mira concluye que esa
 * decisión no está tomada.
 */
const RAIZ = process.cwd();
const CARPETA = join(RAIZ, "docs", "adr");

const ficheros = readdirSync(CARPETA)
  .filter((nombre) => nombre.endsWith(".md"))
  .sort();

const diseno = readFileSync(join(RAIZ, "docs", "DESIGN.md"), "utf8");

/** El título de un ADR es su primer encabezado, que puede ir tras un frontmatter. */
function titulo(nombre: string): string {
  const texto = readFileSync(join(CARPETA, nombre), "utf8");
  const encontrado = /^# (.+)$/m.exec(texto);
  if (encontrado?.[1] === undefined) throw new Error(`${nombre} no tiene encabezado`);
  return encontrado[1];
}

/** La fila del índice que enlaza a ese fichero, si está. */
function fila(nombre: string): string | undefined {
  return diseno
    .split("\n")
    .find((linea) => linea.startsWith("|") && linea.includes(`](./adr/${nombre})`));
}

describe("el índice de ADR de DESIGN.md", () => {
  it.each(ficheros)("incluye %s", (nombre) => {
    expect(fila(nombre)).toBeDefined();
  });

  it.each(ficheros)("lo llama como se llama: %s", (nombre) => {
    expect(fila(nombre)).toContain(titulo(nombre));
  });

  it("no enlaza ningún ADR que no exista", () => {
    const enlazados = [...diseno.matchAll(/\]\(\.\/adr\/([^)]+)\)/g)].map((m) => m[1]);
    expect(enlazados.length).toBeGreaterThan(0);
    expect([...new Set(enlazados)].filter((n) => n !== undefined && !ficheros.includes(n))).toEqual([]);
  });

  /**
   * La 0005 se dejó en pie a propósito para que se vea el error que corrige la
   * 0008. Sin marcar, en una lista parece vigente.
   */
  it("marca como sustituida la que lo está", () => {
    const sustituidas = ficheros.filter((nombre) =>
      /^status: superseded/m.test(readFileSync(join(CARPETA, nombre), "utf8")),
    );
    expect(sustituidas).not.toEqual([]);
    for (const nombre of sustituidas) {
      expect(fila(nombre)).toMatch(/~~.+~~/);
    }
  });
});
