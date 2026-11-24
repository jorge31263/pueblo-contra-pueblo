import { Panel } from "./Panel.js";

const AVISOS = "https://github.com/jorge31263/pueblo-contra-pueblo";
const PRIVACIDAD_GITHUB = "https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement";

/**
 * El nombre del titular no está puesto a propósito: publicarlo es decisión de
 * quien lo mantiene, no de este fichero, y una dirección publicada ya no se
 * despublica. Mientras valga `undefined`, el texto habla de "una persona a
 * título particular", que es cierto. Poner aquí el nombre lo cambia todo.
 */
const TITULAR: string | undefined = undefined;

const ACTUALIZADO = "24 de noviembre de 2026";

export function AvisoLegal() {
  return (
    <Panel etiqueta="Aviso legal" titulo="Aviso legal">
      <p>
        Pueblo contra pueblo es un juego gratuito que mantiene{" "}
        {TITULAR ?? "una persona a título particular"} por gusto. No tiene publicidad, no vende
        nada, no pide dinero y no persigue ánimo de lucro. El código está{" "}
        <a href={AVISOS} className="underline" target="_blank" rel="noopener noreferrer">
          publicado entero
        </a>
        , así que cualquiera puede comprobar lo que dice este aviso en vez de creérselo.
      </p>

      <h3 className="pt-2 font-semibold text-slate-900">Datos personales</h3>
      <p>
        El juego no te pide nada y no recoge nada. No hay cuentas, no hay servidor y no hay
        analítica: nadie sabe cuánta gente juega ni quién, y eso incluye a quien lo ha hecho.
      </p>
      <p>
        Lo único que se guarda son tres cosas, y se quedan en el almacenamiento local de tu
        navegador: tu mejor racha del reto, tu mejor racha del modo libre y si ya has jugado el
        reto de hoy. Son dos números y una fecha. No se envían a ningún sitio, no salen de tu
        dispositivo y desaparecen en cuanto borras los datos del sitio en tu navegador.
      </p>

      <h3 className="pt-2 font-semibold text-slate-900">Cookies</h3>
      <p>
        No se usan cookies, ni propias ni de terceros, ni hay rastreadores de ningún tipo. El
        almacenamiento local que acabas de leer es técnico y necesario para que el juego
        funcione, así que no hay consentimiento que pedir ni banner que aceptar.
      </p>

      <h3 className="pt-2 font-semibold text-slate-900">Alojamiento</h3>
      <p>
        La web está alojada en GitHub Pages, de GitHub, Inc. Aunque el juego no mande nada, el
        servidor que te sirve la página registra las peticiones que recibe, con tu dirección IP
        entre ellas, en sus propios registros y bajo{" "}
        <a
          href={PRIVACIDAD_GITHUB}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          su política de privacidad
        </a>
        , sobre la que aquí no hay ningún control. Pasa con cualquier web, pero conviene saberlo.
      </p>

      <h3 className="pt-2 font-semibold text-slate-900">Datos y licencias</h3>
      <p>
        Las cifras de población vienen del padrón del INE. La altitud y la extensión salen del
        Nomenclátor Geográfico del IGN, publicado con licencia CC-BY 4.0: esto es obra derivada
        de NGMEP CC-BY 4.0 ign.es. Los datos son los oficiales, lo que no garantiza que sean
        exactos, y el juego no sirve como fuente para nada serio.
      </p>

      <h3 className="pt-2 font-semibold text-slate-900">Responsabilidad</h3>
      <p>
        Esto es un juego hecho en los ratos libres. No se garantiza que esté disponible, ni que
        siga estándolo mañana, ni que las cifras estén al día. Si encuentras un error,{" "}
        <a
          href={`${AVISOS}/issues`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          escríbelo en los issues
        </a>
        .
      </p>

      <p className="pt-2 text-sm text-slate-500">Última actualización: {ACTUALIZADO}.</p>
    </Panel>
  );
}
