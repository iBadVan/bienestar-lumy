"use client";

import { useEffect, useState } from "react";
import { Boton, Cabecera, Pantalla } from "@/components/ui";

const FASES = [
  { texto: "inhala", ms: 4000 },
  { texto: "sostén", ms: 4000 },
  { texto: "suelta", ms: 6000 },
];

export default function Respirar() {
  const [seg, setSeg] = useState(5 * 60);
  const [fase, setFase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeg((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFase((f) => (f + 1) % FASES.length), FASES[fase].ms);
    return () => clearTimeout(t);
  }, [fase]);

  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");

  return (
    <Pantalla>
      <Cabecera titulo="Respiración guiada" volver="/app" />
      <h1 className="font-display text-2xl font-bold">Respira conmigo</h1>
      <p className="mb-2 text-sm text-lumy-tintaSuave">
        Sigue el círculo. Inhala cuando crece, sostén, y suelta cuando baja.
      </p>

      <div className="grid flex-1 place-items-center">
        <div className="orbe grid h-32 w-32 place-items-center rounded-full bg-lumy-gradient text-sm font-semibold text-white shadow-soft">
          {FASES[fase].texto}
        </div>
      </div>

      <p className="mb-5 text-center font-display text-4xl font-bold tabular-nums">
        {mm}:{ss}
      </p>
      <Boton href="/app/actividad" variante="azul">
        Ya me siento mejor
      </Boton>
      <div className="mt-3">
        <Boton href="/app" variante="blanco">
          Salir
        </Boton>
      </div>
    </Pantalla>
  );
}
