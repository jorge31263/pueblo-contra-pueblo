/** Un pueblo: municipio español de menos de 20.000 habitantes (ver GLOSSARY.md). */
export type Pueblo = {
  id: string;
  nombre: string;
  provincia: string;
  habitantes: number;
  altitud: number;
  extension: number;
};

/** Las tres magnitudes sobre las que se compara. */
export type Metrica = "habitantes" | "altitud" | "extension";

export const METRICAS: readonly Metrica[] = ["habitantes", "altitud", "extension"];

export type Catalogo = readonly Pueblo[];

/** Los dos pueblos que se enfrentan en una ronda. */
export type Par = readonly [Pueblo, Pueblo];

/** Una ronda: un par, una métrica y cuál de los dos gana. */
export type Ronda = {
  par: Par;
  metrica: Metrica;
  ganador: 0 | 1;
};
