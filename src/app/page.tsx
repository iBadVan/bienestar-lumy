import { Boton, Lumy, Pantalla } from "@/components/ui";

export default function Inicio() {
  return (
    <Pantalla>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Lumy size={150} expresion="feliz" />
        <h1 className="mt-6 font-display text-[2.1rem] font-bold leading-tight text-lumy-tinta">
          Bienestar <span className="text-lumy-rosa">✦</span>
        </h1>
        <p className="mb-10 mt-1 text-[0.95rem] text-lumy-tintaSuave">
          Tu espacio para crecer, sentir y avanzar.
        </p>
        <div className="w-full">
          <Boton href="/consentimiento">Comenzar el viaje →</Boton>
        </div>
      </div>
    </Pantalla>
  );
}
