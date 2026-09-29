"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Visor de afiches. En un celular una infografia vertical no se lee entera,
 * asi que se muestra reducida y al tocarla se abre a pantalla completa con
 * desplazamiento.
 */
export function Afiche({ archivo, titulo }: { archivo: string; titulo: string }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="mb-4 block w-full overflow-hidden rounded-card bg-white shadow-card"
      >
        <Image
          src={`/afiches/${archivo}.webp`}
          alt={titulo}
          width={1080}
          height={1528}
          className="h-auto w-full"
          priority
        />
        <span className="block px-4 py-3 text-xs text-lumy-tintaSuave">
          Toca para verlo en grande
        </span>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/90">
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
            className="sticky top-3 z-10 ml-auto mr-3 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-xl font-bold shadow-soft"
          >
            ×
          </button>
          <Image
            src={`/afiches/${archivo}.webp`}
            alt={titulo}
            width={1080}
            height={1528}
            className="mx-auto h-auto w-full max-w-2xl pb-10"
          />
        </div>
      )}
    </>
  );
}
