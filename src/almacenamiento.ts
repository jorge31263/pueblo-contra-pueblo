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

export function leerMejorRacha(modo: Modo): number {
  const bruto = leer(`mejorRacha.${modo}`);
  const racha = Number(bruto);
  return bruto !== null && Number.isInteger(racha) && racha >= 0 ? racha : 0;
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
