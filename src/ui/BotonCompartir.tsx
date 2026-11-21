import { useState } from "react";
import { textoCompartir, type Resultado } from "../dominio/compartir.js";

/**
 * Comparte por el menú del sistema donde lo haya y copia al portapapeles donde
 * no, diciendo en pantalla lo que ha hecho: un botón que no da señal deja al
 * jugador sin saber si ha pasado algo.
 */
export function BotonCompartir({ resultado }: { resultado: Resultado }) {
  const [aviso, setAviso] = useState<string | null>(null);

  const compartir = async () => {
    const texto = textoCompartir(resultado);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text: texto });
        return;
      }
      await navigator.clipboard.writeText(texto);
      setAviso("Copiado: ya puedes pegarlo");
    } catch {
      setAviso("No he podido copiarlo; selecciona el texto a mano");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void compartir()}
        className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
      >
        Compartir la racha
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-slate-500">
        {aviso}
      </p>
    </div>
  );
}
