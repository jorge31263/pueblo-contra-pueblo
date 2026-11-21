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
 * Redondea como se lee la métrica: no existe medio habitante ni medio metro.
 * Y un valor diminuto no se anima: contar hasta 0,01 km² sería enseñar un cero
 * que es falso durante casi todo el revelado.
 */
function redondear(valor: number, metrica: Metrica): number {
  return metrica === "extension" ? Math.round(valor * 100) / 100 : Math.round(valor);
}

export function Contador({ valor, metrica }: { valor: number; metrica: Metrica }) {
  const directo = prefiereMenosMovimiento() || valor < 1;
  // Arranca en el primer paso y no en cero: dos tarjetas enseñando "0 m" a la
  // vez parecen un empate, no un contador subiendo.
  const [mostrado, setMostrado] = useState(() =>
    directo ? valor : redondear(valor / PASOS, metrica),
  );

  useEffect(() => {
    if (directo) {
      setMostrado(valor);
      return;
    }
    let paso = 0;
    const intervalo = setInterval(() => {
      paso += 1;
      setMostrado(paso >= PASOS ? valor : redondear((valor * paso) / PASOS, metrica));
      if (paso >= PASOS) clearInterval(intervalo);
    }, MILISEGUNDOS_DE_REVELADO / 2 / PASOS);
    return () => clearInterval(intervalo);
  }, [valor, metrica, directo]);

  return <span>{formatearValor(mostrado, metrica)}</span>;
}
