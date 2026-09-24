import { Boton, Pantalla, Tarjeta } from "@/components/ui";
import { DIAS_TOTALES } from "@/lib/config";

export default function Consentimiento() {
  return (
    <Pantalla>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="mb-4 text-center font-display text-2xl font-bold">Tu espacio seguro</h1>
        <Tarjeta className="mb-6 space-y-3 text-[0.9rem] leading-relaxed text-lumy-tinta">
          <p>¡Hola! Antes de empezar, queremos contarte cómo cuidamos tu información.</p>
          <p>
            Todo lo que compartas, escribas o sientas en esta aplicación es{" "}
            <b className="text-lumy-fucsia">totalmente confidencial</b>.
          </p>
          <p>
            Este espacio ha sido creado con fines académicos y para apoyar tu bienestar emocional
            durante estos {DIAS_TOTALES} días. No compartiremos tus respuestas personales con tus
            amigos, profesores ni familiares sin tu permiso.
          </p>
          <p>
            Al continuar, aceptas que la información se utilice de forma anónima para entender mejor
            cómo ayudar a adolescentes como tú.
          </p>
        </Tarjeta>
        <Boton href="/ingreso" variante="azul">
          ✓ Entendido, acepto
        </Boton>
      </div>
    </Pantalla>
  );
}
