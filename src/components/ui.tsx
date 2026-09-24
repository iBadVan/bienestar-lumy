"use client";

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

/**
 * Avatar provisional dibujado en SVG.
 * Cuando las investigadoras entreguen la imagen definitiva de Lumy,
 * colocarla en /public/lumy.png y reemplazar este componente por una <Image>.
 */
export function Lumy({ size = 128 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Lumy"
      className="mx-auto block"
    >
      <defs>
        <clipPath id="lumy-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
        <linearGradient id="lumy-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBD9EA" />
          <stop offset="1" stopColor="#DCC9F6" />
        </linearGradient>
      </defs>
      <g clipPath="url(#lumy-clip)">
        <rect width="120" height="120" fill="url(#lumy-bg)" />
        <path d="M60 116c-26 0-42 10-42 22h84c0-12-16-22-42-22z" fill="#9B7BC4" />
        <path d="M32 46c0-18 12-30 28-30s28 12 28 30c0 6-2 10-2 14 0 0 6 36-26 36S34 66 34 66c0-4-2-14-2-20z" fill="#33253C" />
        <ellipse cx="60" cy="62" rx="21" ry="25" fill="#F3CCB2" />
        <path d="M39 50c4-12 14-18 21-18s17 6 21 18c-8-4-14-5-21-5s-13 1-21 5z" fill="#33253C" />
        <circle cx="52" cy="62" r="2.6" fill="#3A2B45" />
        <circle cx="68" cy="62" r="2.6" fill="#3A2B45" />
        <path d="M54 73q6 5 12 0" stroke="#B4705C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="45" cy="68" rx="4" ry="2.6" fill="#EFA9A1" opacity="0.5" />
        <ellipse cx="75" cy="68" rx="4" ry="2.6" fill="#EFA9A1" opacity="0.5" />
      </g>
      <circle cx="60" cy="60" r="58" fill="none" stroke="#fff" strokeWidth="5" />
    </svg>
  );
}

export function Burbuja({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card bg-white/80 px-5 py-4 text-center text-[0.93rem] leading-relaxed text-lumy-tinta shadow-card">
      {children}
    </div>
  );
}
