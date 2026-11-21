/**
 * El INE escribe los nombres oficiales con el artículo detrás ("Coruña, A").
 * Nadie los dice así, de modo que el catálogo los guarda con el artículo
 * delante. Los municipios con dos formas oficiales las traen separadas por "/"
 * y cada una se normaliza por su cuenta.
 */

const ARTICULOS = new Set([
  // castellano y gallego
  "el", "la", "los", "las", "a", "as", "o", "os",
  // catalán, valenciano y balear
  "es", "les", "els", "sa", "ses", "l'", "s'",
]);

function normalizarForma(forma: string): string {
  const corte = forma.lastIndexOf(", ");
  if (corte === -1) return forma;

  const base = forma.slice(0, corte);
  const articulo = forma.slice(corte + 2).trim();
  if (!ARTICULOS.has(articulo.toLowerCase())) return forma;

  const separador = articulo.endsWith("'") ? "" : " ";
  return articulo + separador + base;
}

export function normalizarNombre(oficial: string): string {
  return oficial.split("/").map(normalizarForma).join("/");
}
