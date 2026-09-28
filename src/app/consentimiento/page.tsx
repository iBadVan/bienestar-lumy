import { Boton, Pantalla, Tarjeta } from "@/components/ui";
import { DIAS_TOTALES } from "@/lib/config";

/**
 * Texto de confidencialidad definitivo, redactado por las investigadoras
 * y recibido el 25 de septiembre de 2026 (respuesta C4). No modificar sin
 * su autorizacion: forma parte de lo aprobado para el estudio.
 */
export default function Consentimiento() {
  return (
    <Pantalla>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="mb-4 text-center font-display text-2xl font-bold">Tu espacio seguro</h1>
        <Tarjeta className="mb-6 space-y-3 text-[0.9rem] leading-relaxed text-lumy-tinta">
          <p>
            &iexcl;Hola! &#128153; Antes de comenzar, queremos contarte c&oacute;mo cuidamos la
            informaci&oacute;n que compartas en esta aplicaci&oacute;n.
          </p>
          <p>
            Todo lo que escribas o respondas ser&aacute; tratado con respeto, privacidad y cuidado.
            Esta aplicaci&oacute;n ha sido creada con fines acad&eacute;micos y busca
            acompa&ntilde;arte durante estos {DIAS_TOTALES} d&iacute;as, ayud&aacute;ndonos a conocer
            mejor tu bienestar emocional.
          </p>
          <p>
            Tus respuestas ser&aacute;n utilizadas de forma an&oacute;nima para fines
            acad&eacute;micos. No compartiremos tus respuestas personales con tus amigos, profesores o
            familiares de manera individual.
          </p>
          <p>
            Tu privacidad es importante para nosotros y queremos que te sientas en un espacio seguro
            para expresarte con confianza.
          </p>
          <p>
            Al continuar, confirmas que has le&iacute;do y comprendido este aviso y aceptas el uso
            an&oacute;nimo de la informaci&oacute;n que proporciones para fines acad&eacute;micos.
          </p>
        </Tarjeta>
        <Boton href="/ingreso" variante="azul">
          &#10003; Entendido, acepto
        </Boton>
      </div>
    </Pantalla>
  );
}
