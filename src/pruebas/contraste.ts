/**
 * Contraste de texto medido sobre el DOM pintado, para lo que el detector de
 * impeccable no alcanza: escanea URLs, y la pantalla de resumen solo se llega
 * jugando.
 *
 * jsdom no carga la hoja de Tailwind, así que `getComputedStyle` no sabe de
 * qué color es nada. En vez de eso se leen las clases y se resuelven contra la
 * paleta de Tailwind, que es de donde salen los colores de verdad.
 */
import paleta from "tailwindcss/colors";

const BLANCO = "#ffffff";
const NEGRO = "#000000";

/** Mínimo de la WCAG 2.1 nivel AA para texto. */
export const MINIMO_AA = 4.5;

type Familia = Record<string, string>;

/**
 * `text-slate-500` → `#64748b`. Devuelve null para todo lo que no sea un
 * color: `text-sm`, `text-center` y `text-6xl` también empiezan por `text-`.
 */
export function colorDeClase(clase: string, prefijo: "text" | "bg"): string | null {
  // Un `hover:` o un `focus:` no pintan la pantalla en reposo, que es lo que
  // se mide aquí.
  if (clase.includes(":")) return null;
  if (!clase.startsWith(`${prefijo}-`)) return null;

  const resto = clase.slice(prefijo.length + 1);
  if (resto === "white") return BLANCO;
  if (resto === "black") return NEGRO;

  const partes = /^([a-z]+)-(\d{2,3})$/.exec(resto);
  if (partes === null) return null;

  const [, nombre, tono] = partes;
  if (nombre === undefined || tono === undefined) return null;
  const familia = (paleta as unknown as Record<string, Familia>)[nombre];
  const color = familia?.[tono];
  return typeof color === "string" && color.startsWith("#") ? color : null;
}

function aCanal(valor: number): number {
  const v = valor / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = aCanal((n >> 16) & 255);
  const g = aCanal((n >> 8) & 255);
  const b = aCanal(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** La razón de contraste de la WCAG, entre 1 (invisible) y 21 (negro y blanco). */
export function contraste(uno: string, otro: string): number {
  const a = luminancia(uno);
  const b = luminancia(otro);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function heredado(elemento: Element, prefijo: "text" | "bg"): string | null {
  for (let nodo: Element | null = elemento; nodo !== null; nodo = nodo.parentElement) {
    for (const clase of Array.from(nodo.classList)) {
      const color = colorDeClase(clase, prefijo);
      if (color !== null) return color;
    }
  }
  return null;
}

/** Elementos con texto propio: los contenedores no pintan letras. */
function conTextoPropio(raiz: Element): Element[] {
  return Array.from(raiz.querySelectorAll("*")).filter((elemento) =>
    Array.from(elemento.childNodes).some(
      (hijo) => hijo.nodeType === 3 && (hijo.textContent ?? "").trim() !== "",
    ),
  );
}

export type Fallo = { texto: string; color: string; fondo: string; razon: number };

/**
 * Todo texto que no llegue al mínimo. El fondo por defecto es blanco y el
 * color por defecto negro, que es lo que hereda la página sin clase propia.
 */
export function fallosDeContraste(raiz: Element, minimo = MINIMO_AA): Fallo[] {
  const fallos: Fallo[] = [];
  for (const elemento of conTextoPropio(raiz)) {
    // Un icono marcado como decorativo no se lee: no tiene que contrastar.
    if (elemento.closest('[aria-hidden="true"]') !== null) continue;

    const color = heredado(elemento, "text") ?? NEGRO;
    const fondo = heredado(elemento, "bg") ?? BLANCO;
    const razon = contraste(color, fondo);
    if (razon < minimo) {
      const texto = (elemento.textContent ?? "").trim().slice(0, 40);
      fallos.push({ texto, color, fondo, razon: Math.round(razon * 100) / 100 });
    }
  }
  return fallos;
}
