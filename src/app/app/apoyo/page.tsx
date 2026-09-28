"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Boton, Burbuja, Lumy, Pantalla } from "@/components/ui";
import { EXPRESION_APOYO, MENSAJES_LUMY } from "@/lib/config";

function Contenido() {
  const emo = useSearchParams().get("emo") ?? "miedo";
  const msg = MENSAJES_LUMY[emo] ?? MENSAJES_LUMY.miedo;

  return (
    <div className="flex flex-1 flex-col justify-center">
      <Lumy size={140} expresion={EXPRESION_APOYO[emo] ?? "preocupada"} />
      <div className="my-6">
        <Burbuja>&ldquo;{msg}&rdquo;</Burbuja>
      </div>
      <Boton href="/app/respirar" variante="azul">
        Respirar con Lumy
      </Boton>
      <div className="mt-3">
        <Boton href="/app" variante="blanco">
          Ir al inicio
        </Boton>
      </div>
    </div>
  );
}

export default function Apoyo() {
  return (
    <Pantalla>
      <Suspense fallback={null}>
        <Contenido />
      </Suspense>
    </Pantalla>
  );
}
