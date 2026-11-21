/**
 * El día del reto es el peninsular, no el del reloj de quien juega (ADR 0007):
 * si no, dos personas que comparten su racha podrían estar hablando de retos
 * distintos. `Intl` ya conoce los cambios de hora, así que no se restan
 * desfases a mano.
 */
const ZONA = "Europe/Madrid";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** El día civil peninsular de un instante, en formato AAAA-MM-DD. */
export function semillaDelDia(instante: Date): string {
  // El locale sueco escribe las fechas en ISO, que es justo lo que queremos.
  return new Intl.DateTimeFormat("sv-SE", { timeZone: ZONA }).format(instante);
}

/** "2026-11-21" se convierte en "21 nov". */
export function fechaLegible(semilla: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(semilla);
  if (partes === null) return semilla;
  return `${Number(partes[3])} ${MESES[Number(partes[2]) - 1]}`;
}
