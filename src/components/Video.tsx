"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reproductor de los videos de la intervencion.
 *
 * No obliga a verlo entero: una participante con un celular lento o poca
 * bateria se frustraria. En su lugar registra cuanto vio, que para el analisis
 * de adherencia es mas util que forzarla a quedarse.
 *
 * El archivo viaja dentro del APK, asi que no consume datos ni necesita
 * conexion.
 */
export function Video({
  archivo,
  titulo,
  alTerminar,
}: {
  archivo: string;
  titulo: string;
  alTerminar?: (segundosVistos: number, porcentaje: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [maximo, setMaximo] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [completo, setCompleto] = useState(false);

  // Se informa al salir, no en cada segundo, para no saturar.
  useEffect(() => {
    return () => {
      if (alTerminar && duracion > 0) {
        alTerminar(Math.round(maximo), Math.round((maximo / duracion) * 100));
      }
    };
  }, [alTerminar, maximo, duracion]);

  const pct = duracion > 0 ? Math.min(100, Math.round((maximo / duracion) * 100)) : 0;

  return (
    <div className="mb-4">
      <video
        ref={ref}
        src={`/videos/${archivo}.mp4`}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-card bg-black shadow-card"
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setMaximo((m) => (t > m ? t : m));
        }}
        onEnded={() => setCompleto(true)}
        aria-label={titulo}
      />

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lumy-linea">
          <div
            className="h-full rounded-full bg-lumy-gradient transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[0.7rem] text-lumy-tintaSuave">
          {completo ? "Completo" : `${pct}%`}
        </span>
      </div>

      <p className="mt-2 text-[0.7rem] text-lumy-tintaSuave">
        Ponte cómoda y sube el volumen. Puedes repetirlo las veces que quieras.
      </p>
    </div>
  );
}
