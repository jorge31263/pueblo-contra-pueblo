/**
 * Lo poco que el juego recuerda entre visitas: la mejor racha de cada modo y
 * si el reto de hoy ya se jugó.
 *
 * Todo pasa por try/catch. En navegación privada, con las cookies bloqueadas o
 * con la cuota llena, `localStorage` lanza al leer o al escribir, y entonces
 * el juego tiene que seguir jugándose: lo único que se pierde es la memoria.
 */
export type Modo = "diario" | "libre";

const PREFIJO = "pcp.";

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(PREFIJO + clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    // Sin memoria, pero el juego sigue.
  }
}

/**
 * Nadie encadena mil aciertos, así que una cifra mayor es un valor manipulado
 * a mano en el navegador y no una racha. Number.isInteger(1e21) es true, de
 * ahí el techo.
 */
const RACHA_MAXIMA_CREIBLE = 1000;

export function leerMejorRacha(modo: Modo): number {
  const bruto = leer(`mejorRacha.${modo}`);
  const racha = Number(bruto);
  const creible = Number.isInteger(racha) && racha >= 0 && racha <= RACHA_MAXIMA_CREIBLE;
  return bruto !== null && creible ? racha : 0;
}

export function guardarMejorRacha(modo: Modo, racha: number): void {
  if (racha > leerMejorRacha(modo)) escribir(`mejorRacha.${modo}`, String(racha));
}

export function retoDiarioJugado(semilla: string): boolean {
  return leer("retoDiario") === semilla;
}

export function marcarRetoDiarioJugado(semilla: string, racha: number): void {
  escribir("retoDiario", semilla);
  guardarMejorRacha("diario", racha);
}
