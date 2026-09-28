"use client";

import { useRouter } from "next/navigation";
import { Cabecera, Pantalla } from "@/components/ui";
import { EMOCIONES } from "@/lib/config";
import { encolar } from "@/lib/datos";
import { useStore } from "@/lib/store";

export default function RegistroEmocion() {
  const { s, set } = useStore();
  const router = useRouter();

  function elegir(id: string) {
    const alerta = EMOCIONES.find((x) => x.id === id)?.alerta;
    set((e) => {
      // I2: hasta dos registros por día, el segundo reemplaza al anterior
      const delDia = e.emociones.filter((x) => x.dia === e.dia);
      if (delDia.length >= 2) {
        const ultimo = delDia[delDia.length - 1];
        e.emociones = e.emociones.filter((x) => x !== ultimo);
      }
      e.emociones.push({ dia: e.dia, emocion: id, fecha: new Date().toISOString() });
      encolar("registros_emocion", { dia: e.dia, emocion: id });
      return e;
    });
    router.push(alerta ? `/app/apoyo?emo=${id}` : "/app");
  }

  if (!s.perfil) return null;

  return (
    <Pantalla>
      <Cabecera titulo="Registro emocional" volver="/app" />
      <h1 className="text-center font-display text-2xl font-bold">¿Cómo te sientes hoy?</h1>
      <p className="mb-6 text-center text-sm text-lumy-tintaSuave">
        Tu respuesta es un secreto entre nosotros.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {EMOCIONES.map((e) => (
          <button
            key={e.id}
            onClick={() => elegir(e.id)}
            className={`${e.bg} rounded-card py-6 text-center shadow-card transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lumy-morado`}
          >
            <span className="block text-4xl leading-none">{e.face}</span>
            <span className="mt-2 block text-sm font-medium">{e.nombre}</span>
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-[0.7rem] text-lumy-tintaSuave">
        Puedes registrar hasta dos veces al día y corregirlo si te equivocaste.
      </p>
    </Pantalla>
  );
}
