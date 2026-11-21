import { fechaLegible } from "./semilla.js";

/**
 * El texto que se pega en un chat. Tiene que ser comparable y no destripar
 * nada: ni nombres de pueblos ni métricas, o el reto de quien lo reciba ya
 * viene resuelto.
 */
export type Resultado = {
  racha: number;
  semilla: string;
  modo: "diario" | "libre";
  url: string;
};

function cuadricula(racha: number): string {
  if (racha === 0) return "🟥";
  if (racha === 1) return "🟩 🟥";
  return `🟩×${racha} 🟥`;
}

export function textoCompartir({ racha, semilla, modo, url }: Resultado): string {
  const cabecera =
    modo === "diario" ? `Pueblo contra pueblo · ${fechaLegible(semilla)}` : "Pueblo contra pueblo";
  const enlace = modo === "diario" ? url : `${url}#libre=${semilla}`;
  return `${cabecera}\nRacha ${racha} ${cuadricula(racha)}\n¿Me ganas? ${enlace}`;
}
