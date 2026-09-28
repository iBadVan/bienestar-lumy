"use client";

import Link from "next/link";
import { useState } from "react";
import { DIAS_TOTALES, PLAZO_ALERTA_HORAS, PUNTOS_DIA, alertaVencida } from "@/lib/config";
import { Estado, useStore } from "@/lib/store";

/** Participantes de demostración, para que las pantallas no se vean vacías. */
const DEMO = [
  { cod: "LMY-0002", edad: 15, sexo: "F", grado: "3ro", avance: 47, ult: "Hoy 08:30", estado: "Activa" },
  { cod: "LMY-0003", edad: 14, sexo: "M", grado: "2do", avance: 33, ult: "Ayer", estado: "Alerta" },
  { cod: "LMY-0004", edad: 16, sexo: "F", grado: "4to", avance: 40, ult: "Hoy 09:15", estado: "Activa" },
  { cod: "LMY-0005", edad: 13, sexo: "M", grado: "1ro", avance: 15, ult: "Hace 3 días", estado: "Inactiva" },
  { cod: "LMY-0006", edad: 17, sexo: "F", grado: "5to", avance: 50, ult: "Hoy 07:10", estado: "Activa" },
];

const comilla = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function csv(s: Estado, tipo: string) {
  const cod = s.perfil?.codigo ?? "LMY-0001";
  if (tipo === "emociones") {
    return ["codigo,dia,emocion,fecha"]
      .concat(s.emociones.map((e) => [cod, e.dia, e.emocion, e.fecha].map(comilla).join(",")))
      .join("\n");
  }
  if (tipo === "diario") {
    return ["codigo,dia,modulo,caracteres,texto,fecha"]
      .concat(s.diario.map((d) => [cod, d.dia, d.tipo, d.texto.length, d.texto, d.fecha].map(comilla).join(",")))
      .join("\n");
  }
  if (tipo === "quizes") {
    return ["codigo,dia,modulo,puntaje,total"]
      .concat(s.quizes.map((q) => [cod, q.dia, q.modulo, q.puntaje, q.total].map(comilla).join(",")))
      .join("\n");
  }
  return ["codigo,dia,categoria,prioridad,estado,observacion,extracto,fecha"]
    .concat(
      s.alertas.map((a) =>
        [a.codigo, a.dia, a.categoria, a.prioridad, a.estado, a.observacion, a.extracto, a.fecha]
          .map(comilla)
          .join(","),
      ),
    )
    .join("\n");
}

function descargar(nombre: string, contenido: string) {
  const blob = new Blob(["\ufeff" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Panel() {
  const { s, set, listo } = useStore();
  const [tab, setTab] = useState<"resumen" | "estudiantes" | "alertas">("resumen");

  if (!listo) return null;

  const pct = Math.round((s.completados.length / DIAS_TOTALES) * 100);
  const criticas = s.alertas.filter((a) => a.prioridad >= 3 && a.estado === "pendiente").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Panel de monitoreo</h1>
          <p className="text-sm text-lumy-tintaSuave">
            Resumen de la intervención, día {s.dia} de {DIAS_TOTALES}
          </p>
        </div>
        <Link href="/app" className="rounded-pill bg-white px-4 py-2 text-sm shadow-card">
          Ver como estudiante
        </Link>
      </header>

      <div className="mb-5 flex gap-1 rounded-pill bg-white p-1 shadow-card">
        {(["resumen", "estudiantes", "alertas"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-pill px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t ? "bg-lumy-gradient text-white" : "text-lumy-tintaSuave"
            }`}
          >
            {t}
            {t === "alertas" && criticas > 0 ? ` (${criticas})` : ""}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-card border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm">
        <b className="block">Datos de demostración</b>
        Solo la fila del código propio refleja el uso real. Las demás son inventadas para revisar el
        comportamiento de las pantallas.
      </div>

      {tab === "resumen" && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: DEMO.length + 1, l: "Participantes" },
              { v: DEMO.filter((d) => d.estado === "Activa").length + 1, l: "Activas hoy" },
              { v: `${pct}%`, l: "Progreso global" },
              { v: criticas, l: "Alertas críticas" },
            ].map((k) => (
              <div key={k.l} className="rounded-card bg-white p-4 shadow-card">
                <b className="block font-display text-2xl">{k.v}</b>
                <span className="text-xs text-lumy-tintaSuave">{k.l}</span>
              </div>
            ))}
          </div>

          <div className="rounded-card bg-white p-5 shadow-card">
            <h2 className="mb-1 font-display text-base font-semibold">Exportar datos</h2>
            <p className="mb-3 text-sm text-lumy-tintaSuave">
              Archivos CSV con codificación UTF-8, listos para abrir en Excel o importar a SPSS.
            </p>
            <div className="flex flex-wrap gap-2">
              {["emociones", "diario", "quizes", "alertas"].map((t) => (
                <button
                  key={t}
                  onClick={() => descargar(`bienestar_${t}.csv`, csv(s, t))}
                  className="rounded-2xl border border-lumy-linea bg-white px-4 py-2 text-sm font-medium capitalize transition hover:border-lumy-rosa"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "estudiantes" && (
        <div className="overflow-x-auto rounded-card bg-white p-4 shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-lumy-tintaSuave">
                <th className="py-2">Código</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Grado</th>
                <th>Avance</th>
                <th>Último ingreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-lumy-linea">
                <td className="py-2 font-semibold">{s.perfil?.codigo ?? "LMY-0001"}</td>
                <td>{s.perfil?.edad ?? "-"}</td>
                <td>{s.perfil?.sexo || "-"}</td>
                <td>{s.perfil?.grado?.slice(0, 3) || "-"}</td>
                <td>{pct}%</td>
                <td>Ahora</td>
                <td>
                  <span className="rounded-pill bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700">Activa</span>
                </td>
              </tr>
              {DEMO.map((d) => (
                <tr key={d.cod} className="border-t border-lumy-linea">
                  <td className="py-2">{d.cod}</td>
                  <td>{d.edad}</td>
                  <td>{d.sexo}</td>
                  <td>{d.grado}</td>
                  <td>{d.avance}%</td>
                  <td>{d.ult}</td>
                  <td>
                    <span
                      className={`rounded-pill px-2.5 py-0.5 text-xs ${
                        d.estado === "Alerta"
                          ? "bg-amber-100 text-amber-700"
                          : d.estado === "Inactiva"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {d.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-lumy-tintaSuave">
            El nombre completo no se muestra aquí, solo el código de participante.
          </p>
        </div>
      )}

      {tab === "alertas" && (
        <div className="space-y-3">
          {s.alertas.length === 0 && (
            <p className="rounded-card bg-white p-5 text-sm text-lumy-tintaSuave shadow-card">
              Sin alertas registradas. Escribe algo en el diario del estudiante para generar una.
            </p>
          )}
          {s.alertas
            .slice()
            .reverse()
            .map((a) => (
              <div key={a.id} className="rounded-card bg-white p-4 shadow-card">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${
                      a.prioridad >= 4
                        ? "bg-red-100 text-red-700"
                        : a.prioridad === 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-lumy-nube text-lumy-fucsia"
                    }`}
                  >
                    Prioridad {a.prioridad}
                  </span>
                  <b className="text-sm">{a.codigo}</b>
                  <span className="text-xs text-lumy-tintaSuave">
                    día {a.dia} · {a.categoria}
                  </span>
                  {a.estado === "pendiente" && PLAZO_ALERTA_HORAS[a.prioridad] ? (
                    <span
                      className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                        alertaVencida(a.prioridad, a.fecha)
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {alertaVencida(a.prioridad, a.fecha)
                        ? "Fuera de plazo"
                        : `Plazo ${PLAZO_ALERTA_HORAS[a.prioridad]} h`}
                    </span>
                  ) : null}
                  <span className="ml-auto rounded-pill bg-slate-100 px-2.5 py-0.5 text-xs capitalize">
                    {a.estado}
                  </span>
                </div>
                <p className="mb-3 rounded-2xl bg-lumy-crema px-3 py-2 text-sm">{a.extracto}</p>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  {[0, 1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        set((e) => {
                          const x = e.alertas.find((z) => z.id === a.id);
                          if (x) x.prioridad = p;
                          return e;
                        })
                      }
                      className="rounded-xl border border-lumy-linea px-3 py-1 text-xs hover:border-lumy-rosa"
                    >
                      {p}
                    </button>
                  ))}
                  {(["en seguimiento", "cerrada"] as const).map((est) => (
                    <button
                      key={est}
                      onClick={() =>
                        set((e) => {
                          const x = e.alertas.find((z) => z.id === a.id);
                          if (x) x.estado = est;
                          return e;
                        })
                      }
                      className="rounded-xl border border-lumy-linea px-3 py-1 text-xs capitalize hover:border-lumy-rosa"
                    >
                      {est}
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full rounded-2xl border border-lumy-linea bg-white px-3 py-2 text-sm"
                  placeholder="Observación de la investigadora..."
                  defaultValue={a.observacion}
                  onBlur={(ev) =>
                    set((e) => {
                      const x = e.alertas.find((z) => z.id === a.id);
                      if (x) x.observacion = ev.target.value;
                      return e;
                    })
                  }
                />
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 rounded-card bg-white p-5 shadow-card">
        <h2 className="mb-1 font-display text-base font-semibold">Controles de prueba</h2>
        <p className="mb-3 text-sm text-lumy-tintaSuave">
          Solo existen en la demo, para recorrer los {DIAS_TOTALES} días sin esperar un mes.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => set((e) => ({ ...e, dia: Math.max(1, e.dia - 1) }))}
            className="rounded-2xl border border-lumy-linea px-4 py-2 text-sm"
          >
            Día anterior
          </button>
          <button
            onClick={() => set((e) => ({ ...e, dia: Math.min(DIAS_TOTALES, e.dia + 1) }))}
            className="rounded-2xl border border-lumy-linea px-4 py-2 text-sm"
          >
            Día siguiente
          </button>
          <button
            onClick={() =>
              set((e) => {
                for (let k = 0; k < 7 && e.dia < DIAS_TOTALES; k++) {
                  if (!e.completados.includes(e.dia)) {
                    e.completados.push(e.dia);
                    e.puntos += PUNTOS_DIA;
                  }
                  e.dia++;
                }
                return e;
              })
            }
            className="rounded-2xl border border-lumy-linea px-4 py-2 text-sm"
          >
            Avanzar 7 días
          </button>
          <button
            onClick={() => {
              window.localStorage.removeItem("bienestar_lumy_v1");
              window.location.href = "/";
            }}
            className="rounded-2xl border border-lumy-linea px-4 py-2 text-sm"
          >
            Empezar de cero
          </button>
        </div>
      </div>
    </div>
  );
}
