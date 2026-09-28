"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

/* ------------------------------------------------------------- contenedor - */

export function Pantalla({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {children}
    </main>
  );
}

export function Cabecera({ titulo, volver }: { titulo: string; volver: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link
        href={volver}
        aria-label="Volver"
        className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white text-lg text-lumy-tinta shadow-card"
      >
        ‹
      </Link>
      <span className="text-sm text-lumy-tintaSuave">{titulo}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- botones - */

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variante?: "gradiente" | "azul" | "blanco";
  disabled?: boolean;
  type?: "button" | "submit";
};

const base =
  "block w-full rounded-pill px-5 py-3.5 text-center text-[0.95rem] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumy-morado disabled:opacity-45";

const estilos: Record<string, string> = {
  gradiente: "bg-lumy-gradient text-white shadow-soft hover:brightness-105",
  azul: "bg-lumy-azul text-white shadow-soft hover:bg-lumy-azulOscuro",
  blanco: "bg-white text-lumy-tinta shadow-card hover:bg-lumy-nube",
};

export function Boton({ children, onClick, href, variante = "gradiente", disabled, type = "button" }: BtnProps) {
  const cls = `${base} ${estilos[variante]}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- tarjetas - */

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card bg-white p-4 shadow-card ${className}`}>{children}</div>
  );
}

export function Campo({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs text-lumy-tintaSuave">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[0.7rem] text-lumy-tintaSuave">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-lumy-linea bg-white px-4 py-3 text-[0.95rem] text-lumy-tinta outline-none placeholder:text-lumy-tintaSuave/60 focus:border-lumy-rosa focus:ring-2 focus:ring-lumy-rosa/25";

/* ------------------------------------------------------------------ lumy -- */

/** Expresiones de Lumy entregadas por las investigadoras. */
export type Expresion =
  | "normal" | "feliz" | "triste" | "enojada" | "sorprendida" | "guinando"
  | "apenada" | "confundida" | "cansada" | "emocionada" | "preocupada" | "juguetona";

export function Lumy({ size = 128, expresion = "normal" }: { size?: number; expresion?: Expresion }) {
  return (
    <Image
      src={`/lumy/${expresion}.png`}
      alt="Lumy"
      width={size}
      height={size}
      priority
      className="mx-auto block rounded-full object-cover shadow-card"
      style={{ width: size, height: size }}
    />
  );
}

export function Burbuja({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card bg-white/80 px-5 py-4 text-center text-[0.93rem] leading-relaxed text-lumy-tinta shadow-card">
      {children}
    </div>
  );
}
