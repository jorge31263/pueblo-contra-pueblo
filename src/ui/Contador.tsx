import { useEffect, useState } from "react";
import type { Metrica } from "../dominio/tipos.js";
import { formatearValor } from "./etiquetas.js";
import { MILISEGUNDOS_DE_REVELADO } from "../dominio/parametros.js";

const PASOS = 24;

function prefiereMenosMovimiento(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * La cifra sube hasta su valor en lo que dura el revelado. Quien ha pedido
 * menos movimiento la ve directamente, sin animación.
 */
export function Contador({ valor, metrica }: { valor: number; metrica: Metrica }) {
  const [mostrado, setMostrado] = useState(() => (prefiereMenosMovimiento() ? valor : 0));

  useEffect(() => {
    if (prefiereMenosMovimiento()) {
      setMostrado(valor);
      return;
    }
    let paso = 0;
    const intervalo = setInterval(() => {
      paso += 1;
      setMostrado(paso >= PASOS ? valor : Math.round((valor * paso) / PASOS * 100) / 100);
      if (paso >= PASOS) clearInterval(intervalo);
    }, MILISEGUNDOS_DE_REVELADO / 2 / PASOS);
    return () => clearInterval(intervalo);
  }, [valor]);

  return <span>{formatearValor(mostrado, metrica)}</span>;
}
