/**
 * El Nomenclátor del IGN es CC-BY 4.0 y obliga a reconocer la fuente donde se
 * publiquen los datos derivados, con esa fórmula exacta. No es decoración: es
 * la condición de la licencia con la que se usan los datos.
 */
export function Pie() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-10 text-center text-xs leading-relaxed text-slate-400">
      <p>
        Habitantes del padrón del{" "}
        <a href="https://www.ine.es" className="underline hover:text-slate-600">
          INE
        </a>
        . Altitud y extensión del Nomenclátor Geográfico del{" "}
        <a href="https://www.ign.es" className="underline hover:text-slate-600">
          ign.es
        </a>
        .
      </p>
      <p className="mt-1">Obra derivada de NGMEP CC-BY 4.0 ign.es</p>
    </footer>
  );
}
