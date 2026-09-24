"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Boton, Pantalla, Tarjeta } from "@/components/ui";
import { DIAS_TOTALES, EMOCIONES, INSIGNIAS, MODULOS } from "@/lib/config";
import { emocionDe, hecho, racha, semanaDe, tipoDia, useStore } from "@/lib/store";

function Grafica({ valores }: { valores: number[] }) {
  if (valores.length < 2) {
    return (
      <p className="mt-2 text-xs text-lumy-tintaSuave">
        Registra al menos dos días para ver tu gráfica.
      </p>
    );
  }
  const w = 280;
  const h = 78;
  const pts = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * (w - 16) + 8;
    const y = h - 10 - ((v - 1) / 4) * (h - 24);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" height={h} aria-label="Evolución de tu ánimo">
      <path d={d} fill="none" stroke="#F06BB0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3.2" fill="#F06BB0" />
      ))}
    </svg>
  );
}

export default function Home() {
  const { s, listo } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (listo && !s.perfil) router.replace("/");
  }, [listo, s.perfil, router]);

  if (!listo || !s.perfil) return null;

  const registradoHoy = emocionDe(s, s.dia).length > 0;
  const tipo = tipoDia(s.dia);
  const mod = MODULOS[tipo];

  const valores = s.emociones
    .slice(-7)
    .map((e) => EMOCIONES.find((x) => x.id === e.emocion)?.valencia ?? 3);

  const desde = Math.max(1, s.dia - 4);
  const hasta = Math.min(DIAS_TOTALES, s.dia + 2);
  const camino = [];
  for (let d = desde; d <= hasta; d++) camino.push(d);

  return (
    <Pantalla>
      <section className="mb-4 rounded-card bg-lumy-gradient p-5 text-white shadow-soft">
        <p className="font-display text-xl font-bold">¡Hola, {s.perfil.codigo}!</p>
        <p className="mb-4 text-sm text-white/85">
          Día {s.dia} de {DIAS_TOTALES}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: racha(s), l: "Racha", i: "🔥" },
            { v: s.puntos, l: "Puntos", i: "⭐" },
            { v: s.insignias.length, l: "Insignias", i: "🏆" },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-white/20 py-2.5 text-center">
              <span className="text-sm">{x.i}</span>
              <b className="block font-display text-lg leading-tight">{x.v}</b>
              <span className="text-[0.66rem] text-white/85">{x.l}</span>
            </div>
          ))}
        </div>
      </section>

      {!registradoHoy && (
        <Tarjeta className="mb-3 border border-lumy-rosa/30">
          <h2 className="font-display text-base font-semibold">¿Cómo te sientes hoy?</h2>
          <p className="mb-3 text-xs text-lumy-tintaSuave">Tu respuesta es un secreto entre nosotros.</p>
          <Boton href="/app/emocion">Registrar mi emoción</Boton>
        </Tarjeta>
      )}

      <Tarjeta className="mb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold">Mi evolución emocional</h2>
          <span className="rounded-pill bg-lumy-nube px-2.5 py-0.5 text-[0.66rem] text-lumy-fucsia">
            Esta semana
          </span>
        </div>
        <Grafica valores={valores} />
      </Tarjeta>

      <Tarjeta className="mb-5">
        <h2 className="font-display text-base font-semibold">
          {mod.ico} {mod.nombre}
        </h2>
        <p className="mb-3 text-xs text-lumy-tintaSuave">La actividad de hoy, día {s.dia}.</p>
        {hecho(s, s.dia) ? (
          <Boton href="/app/actividad" variante="blanco">
            Volver a verla
          </Boton>
        ) : (
          <Boton href={registradoHoy ? "/app/actividad" : "/app/emocion"}>
            {registradoHoy ? "Comenzar" : "Primero registra tu emoción"}
          </Boton>
        )}
      </Tarjeta>

      {s.insignias.length > 0 && (
        <Tarjeta className="mb-5">
          <h2 className="mb-2 font-display text-base font-semibold">Tus insignias</h2>
          <div className="flex flex-wrap gap-1.5">
            {s.insignias.map((n) => {
              const b = INSIGNIAS.find((x) => x.nombre === n);
              return (
                <span key={n} className="rounded-pill bg-lumy-nube px-3 py-1 text-[0.72rem] text-lumy-fucsia">
                  {b?.ico ?? "⭐"} {n}
                </span>
              );
            })}
          </div>
        </Tarjeta>
      )}

      <h2 className="mb-2 font-display text-lg font-semibold">Tu camino</h2>
      <Tarjeta className="mb-8 !p-2">
        <ul>
          {camino.map((d) => {
            const m = MODULOS[tipoDia(d)];
            const done = hecho(s, d);
            const hoy = d === s.dia;
            return (
              <li key={d} className="flex items-center gap-3 border-b border-lumy-linea px-2 py-3 last:border-0">
                <span
                  className={`grid h-7 w-7 flex-none place-items-center rounded-full text-[0.7rem] font-bold ${
                    done ? "bg-emerald-400 text-white" : hoy ? "bg-lumy-rosa text-white" : "bg-lumy-nube text-lumy-fucsia"
                  }`}
                >
                  {done ? "✓" : d}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-medium">
                    {m.ico} {m.nombre}
                  </b>
                  <span className="text-[0.7rem] text-lumy-tintaSuave">
                    Día {d} · semana {semanaDe(d)}
                  </span>
                </span>
                {!done && hoy && <span className="rounded-pill bg-lumy-rosa px-2.5 py-0.5 text-[0.62rem] font-bold text-white">HOY</span>}
                {!done && d < s.dia && <span className="rounded-pill bg-amber-400 px-2.5 py-0.5 text-[0.62rem] font-bold text-white">PENDIENTE</span>}
                {!done && d > s.dia && <span className="rounded-pill bg-lumy-linea px-2.5 py-0.5 text-[0.62rem] font-bold text-lumy-tintaSuave">🔒</span>}
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <Link href="/panel" className="mb-4 block text-center text-xs text-lumy-tintaSuave underline underline-offset-4">
        Ir al panel de administración
      </Link>
    </Pantalla>
  );
}
