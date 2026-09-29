"use client";

import Link from "next/link";
import { Pantalla } from "@/components/ui";
import { esApp } from "@/lib/notificaciones";

function Opcion({ href, ico, texto }: { href: string; ico: string; texto: string }) {
  return (
    <Link
      href={href}
      className="block rounded-card bg-white px-6 py-7 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-lumy-nube text-xl">
        {ico}
      </span>
      <span className="font-display text-[1.05rem] font-semibold">{texto}</span>
    </Link>
  );
}

export default function Ingreso() {
  return (
    <Pantalla>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="mb-7 text-center font-display text-2xl font-bold">¿Cómo quieres ingresar?</h1>
        <div className="space-y-4">
          <Opcion href="/login" ico="🧑" texto="Soy estudiante" />
          {!esApp() && <Opcion href="/panel" ico="🛡️" texto="Soy administradora" />}
        </div>
        <Link
          href="/registro"
          className="mt-7 block text-center text-sm font-medium text-lumy-fucsia underline underline-offset-4"
        >
          ¿No tienes cuenta? Regístrate aquí
        </Link>
      </div>
    </Pantalla>
  );
}
