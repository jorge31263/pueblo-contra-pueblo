import { useEffect, useState } from "react";
import type { Catalogo } from "./dominio/tipos.js";
import { nuevaPartida, responder, agotarTiempo, type Partida } from "./dominio/partida.js";
import { SEGUNDOS_POR_RONDA } from "./dominio/parametros.js";
import { semillaDelDia } from "./dominio/semilla.js";
import { modoDesdeUrl, semillaAleatoria } from "./modos.js";
import {
  leerMejorRacha,
  guardarMejorRacha,
  marcarRetoDiarioJugado,
  retoDiarioJugado,
  type Modo,
} from "./almacenamiento.js";
import { PantallaInicio } from "./ui/PantallaInicio.js";
import { PantallaRonda } from "./ui/PantallaRonda.js";
import { PantallaResumen } from "./ui/PantallaResumen.js";

type EnJuego = { modo: Modo; partida: Partida };

export function App({ catalogo }: { catalogo: Catalogo }) {
  const elegido = modoDesdeUrl(window.location.hash);
  const [juego, setJuego] = useState<EnJuego | null>(() =>
    elegido.modo === "libre"
      ? { modo: "libre", partida: nuevaPartida(catalogo, elegido.semilla ?? semillaAleatoria()) }
      : null,
  );
  // Cambia cuando termina una partida, para releer lo que haya guardado.
  const [version, setVersion] = useState(0);

  /**
   * Instalada en el móvil, la app se queda abierta días. Sin volver a mirar la
   * hora seguiría ofreciendo el reto de ayer, y la racha compartida llevaría
   * la fecha equivocada: dos personas comparando secuencias distintas.
   */
  const [semillaDeHoy, setSemillaDeHoy] = useState(() => semillaDelDia(new Date()));

  useEffect(() => {
    const mirarLaHora = () => setSemillaDeHoy(semillaDelDia(new Date()));
    const reloj = setInterval(mirarLaHora, 60_000);
    window.addEventListener("focus", mirarLaHora);
    document.addEventListener("visibilitychange", mirarLaHora);
    return () => {
      clearInterval(reloj);
      window.removeEventListener("focus", mirarLaHora);
      document.removeEventListener("visibilitychange", mirarLaHora);
    };
  }, []);

  const empezar = (modo: Modo, semilla: string) =>
    setJuego({ modo, partida: nuevaPartida(catalogo, semilla) });

  const terminar = (siguiente: Partida) => {
    if (juego === null) return;
    if (siguiente.estado === "terminada") {
      if (juego.modo === "diario") marcarRetoDiarioJugado(siguiente.semilla, siguiente.racha);
      else guardarMejorRacha("libre", siguiente.racha);
      setVersion((v) => v + 1);
    }
    setJuego({ ...juego, partida: siguiente });
  };

  const alElegir = (eleccion: 0 | 1) => {
    if (juego !== null) terminar(responder(juego.partida, eleccion));
  };

  const alAgotarse = () => {
    if (juego !== null) terminar(agotarTiempo(juego.partida));
  };

  if (juego === null) {
    return (
      <PantallaInicio
        key={version}
        diarioJugado={retoDiarioJugado(semillaDeHoy)}
        mejorDiario={leerMejorRacha("diario")}
        mejorLibre={leerMejorRacha("libre")}
        onJugarDiario={() => empezar("diario", semillaDeHoy)}
        onJugarLibre={() => empezar("libre", semillaAleatoria())}
      />
    );
  }

  if (juego.partida.estado === "jugando") {
    return (
      <PantallaRonda
        ronda={juego.partida.ronda}
        racha={juego.partida.racha}
        onElegir={alElegir}
        // El reloj solo aprieta en el reto diario (ADR 0009).
        segundos={juego.modo === "diario" ? SEGUNDOS_POR_RONDA : undefined}
        onAgotado={alAgotarse}
      />
    );
  }

  return (
    <PantallaResumen
      racha={juego.partida.racha}
      mejor={leerMejorRacha(juego.modo)}
      modo={juego.modo}
      semilla={juego.partida.semilla}
      url={window.location.origin + window.location.pathname}
      ronda={juego.partida.ronda}
      porTiempo={juego.partida.ultimaRespuesta?.porTiempo === true}
      onOtraVez={() => empezar("libre", semillaAleatoria())}
      onInicio={() => {
        // Sin esto, recargar vuelve a meterte en la misma semilla.
        history.replaceState(null, "", window.location.pathname + window.location.search);
        setJuego(null);
      }}
    />
  );
}
