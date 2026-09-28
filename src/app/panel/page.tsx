"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DIAS_TOTALES, PLAZO_ALERTA_HORAS, alertaVencida } from "@/lib/config";
import { cerrarSesion, haySupabase } from "@/lib/datos";
import {
  FilaAlerta,
  FilaParticipante,
  cargarAlertas,
  cargarParticipantes,
  descargarCSV,
  exportar,
  ingresarInvestigadora,
  revisarAlerta,
  sesionInvestigadora,
} from "@/lib/panel";

const TABLAS = [
  { id: "registros_emocion", etiqueta: "Registros emocionales" },
  { id: "entradas_diario", etiqueta: "Diario" },
  { id: "resultados_quiz", etiqueta: "Cuestionarios" },
  { id: "actividades_completadas", etiqueta: "Actividades" },
  { id: "alertas", etiqueta: "Alertas" },
  { id: "respuestas_cierre", etiqueta: "Encuesta final" },
];

export default function Panel() {
  const [quien, setQuien] = useState<{ nombre: string } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<"resumen" | "estudiantes" | "alertas">("resumen");
  const [personas, setPersonas] = useState<FilaParticipante[]>([]);
  const [alertas, setAlertas] = useState<FilaAlerta[]>([]);
  const [filtro, setFiltro] = useState("");
  const [aviso, setAviso] = useState("");

  const refrescar = useCallback(async () => {
    const [p, a] = await Promise.all([cargarParticipantes(), cargarAlertas()]);
    setPersonas(p);
    setAlertas(a);
  }, []);

  useEffect(() => {
    (async () => {
      const s = await sesionInvestigadora();
      setQuien(s);
      if (s) await refrescar();
      setCargando(false);
    })();
  }, [refrescar]);

  if (!haySupabase) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="mb-2 font-display text-xl font-bold">Panel no disponible</h1>
        <p className="text-sm text-lumy-tintaSuave">
          Faltan las credenciales de la base de datos. Revisa el archivo .env.local.
        </p>
      </div>
    );
  }

  if (cargando) {
    return <p className="px-5 py-16 text-center text-sm text-lumy-tintaSuave">Cargando...</p>;
  }

  if (!quien) return <Ingreso alEntrar={(n) => { setQuien(n); void refrescar(); }} />;

  const activas = personas.filter((p) => p.estado === "activa").length;
  const criticas = alertas.filter((a) => a.prioridad_auto >= 3 && a.estado === "pendiente").length;
  const avancePromedio = personas.length
    ? Math.round(personas.reduce((s, p) => s + p.avance, 0) / personas.length)
    : 0;

  const visibles = personas.filter(
    (p) => !filtro || p.codigo.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Panel de monitoreo</h1>
          <p className="text-sm text-lumy-tintaSuave">{quien.nombre}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void refrescar()}
            className="rounded-pill bg-white px-4 py-2 text-sm shadow-card"
          >
            Actualizar
          </button>
          <button
            onClick={() => {
              void cerrarSesion();
              window.location.reload();
            }}
            className="rounded-pill bg-white px-4 py-2 text-sm shadow-card"
          >
            Salir
          </button>
        </div>
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

      {tab === "resumen" && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: personas.length, l: "Participantes" },
              { v: activas, l: "Activas" },
              { v: `${avancePromedio}%`, l: "Avance promedio" },
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
              Datos crudos por registro, sin nombres. Incluyen el retraso de sincronización en
              minutos.
            </p>
            <div className="flex flex-wrap gap-2">
              {TABLAS.map((t) => (
                <button
                  key={t.id}
                  onClick={async () => {
                    setAviso("Preparando...");
                    const csv = await exportar(t.id);
                    if (csv === "sin datos") return setAviso(`${t.etiqueta}: todavía no hay datos.`);
                    descargarCSV(`bienestar_${t.id}.csv`, csv);
                    setAviso("");
                  }}
                  className="rounded-2xl border border-lumy-linea px-4 py-2 text-sm transition hover:border-lumy-rosa"
                >
                  {t.etiqueta}
                </button>
              ))}
            </div>
            {aviso ? <p className="mt-3 text-sm text-lumy-tintaSuave">{aviso}</p> : null}
          </div>
        </>
      )}

      {tab === "estudiantes" && (
        <div className="rounded-card bg-white p-4 shadow-card">
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por código..."
            className="mb-3 w-full rounded-2xl border border-lumy-linea px-4 py-2 text-sm"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-lumy-tintaSuave">
                  <th className="py-2">Código</th>
                  <th>Edad</th>
                  <th>Sexo</th>
                  <th>Grado</th>
                  <th>Días</th>
                  <th>Avance</th>
                  <th>Último ingreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id} className="border-t border-lumy-linea">
                    <td className="py-2 font-medium">{p.codigo}</td>
                    <td>{p.edad ?? "-"}</td>
                    <td>{p.sexo ?? "-"}</td>
                    <td>{p.grado?.slice(0, 3) ?? "-"}</td>
                    <td>
                      {p.dias_completados}/{DIAS_TOTALES}
                    </td>
                    <td>{p.avance}%</td>
                    <td>
                      {p.ultimo_ingreso
                        ? new Date(p.ultimo_ingreso).toLocaleDateString("es-PE")
                        : "Nunca"}
                    </td>
                    <td>
                      <span className="rounded-pill bg-slate-100 px-2.5 py-0.5 text-xs capitalize">
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-lumy-tintaSuave">
            Se muestra el código, nunca el nombre. {visibles.length} de {personas.length}.
          </p>
        </div>
      )}

      {tab === "alertas" && (
        <div className="space-y-3">
          {alertas.length === 0 && (
            <p className="rounded-card bg-white p-5 text-sm text-lumy-tintaSuave shadow-card">
              Sin alertas registradas.
            </p>
          )}
          {alertas.map((a) => (
            <Alerta key={a.id} a={a} alGuardar={() => void refrescar()} />
          ))}
        </div>
      )}

      <Link
        href="/app"
        className="mt-6 block text-center text-xs text-lumy-tintaSuave underline underline-offset-4"
      >
        Ver como estudiante
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------- una alerta - */

function Alerta({ a, alGuardar }: { a: FilaAlerta; alGuardar: () => void }) {
  const [obs, setObs] = useState(a.observacion ?? "");
  const vencida = a.estado === "pendiente" && alertaVencida(a.prioridad_auto, a.recibido_en);
  const retraso = Math.round(
    (new Date(a.recibido_en).getTime() - new Date(a.ocurrido_en).getTime()) / 60000,
  );

  async function aplicar(cambios: Parameters<typeof revisarAlerta>[1]) {
    await revisarAlerta(a.id, cambios);
    alGuardar();
  }

  return (
    <div className={`rounded-card bg-white p-4 shadow-card ${vencida ? "ring-2 ring-red-500" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-pill px-2.5 py-0.5 text-xs font-bold ${
            a.prioridad_auto >= 4
              ? "bg-red-100 text-red-700"
              : a.prioridad_auto === 3
                ? "bg-amber-100 text-amber-700"
                : "bg-lumy-nube text-lumy-fucsia"
          }`}
        >
          Prioridad {a.prioridad_final ?? a.prioridad_auto}
        </span>
        <b className="text-sm">{a.codigo}</b>
        <span className="text-xs text-lumy-tintaSuave">
          día {a.dia} · {a.categoria}
        </span>
        {vencida && (
          <span className="rounded-pill bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Fuera de plazo ({PLAZO_ALERTA_HORAS[a.prioridad_auto]} h)
          </span>
        )}
        <span className="ml-auto rounded-pill bg-slate-100 px-2.5 py-0.5 text-xs capitalize">
          {a.estado}
        </span>
      </div>

      <p className="mb-2 rounded-2xl bg-lumy-crema px-3 py-2 text-sm">{a.extracto}</p>

      <p className="mb-3 text-xs text-lumy-tintaSuave">
        Escrito {new Date(a.ocurrido_en).toLocaleString("es-PE")} · llegó{" "}
        {retraso < 2 ? "al momento" : `${retraso} min después`}
      </p>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => void aplicar({ prioridad_final: p })}
            className={`rounded-xl border px-3 py-1 text-xs ${
              a.prioridad_final === p ? "border-lumy-rosa bg-lumy-nube" : "border-lumy-linea"
            }`}
          >
            {p}
          </button>
        ))}
        {(["en seguimiento", "cerrada"] as const).map((e) => (
          <button
            key={e}
            onClick={() => void aplicar({ estado: e })}
            className="rounded-xl border border-lumy-linea px-3 py-1 text-xs capitalize"
          >
            {e}
          </button>
        ))}
      </div>

      <textarea
        className="w-full rounded-2xl border border-lumy-linea px-3 py-2 text-sm"
        placeholder="Observación de la investigadora..."
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        onBlur={() => obs !== (a.observacion ?? "") && void aplicar({ observacion: obs })}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- ingreso - */

function Ingreso({ alEntrar }: { alEntrar: (q: { nombre: string }) => void }) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="mb-1 font-display text-2xl font-bold">Panel de monitoreo</h1>
      <p className="mb-6 text-sm text-lumy-tintaSuave">Acceso para el equipo de investigación.</p>

      <input
        className="mb-3 w-full rounded-2xl border border-lumy-linea px-4 py-3 text-sm"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      <input
        className="mb-3 w-full rounded-2xl border border-lumy-linea px-4 py-3 text-sm"
        type="password"
        placeholder="Contraseña"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
      />
      {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
      <button
        onClick={async () => {
          const r = await ingresarInvestigadora(correo.trim(), clave);
          if (!r.ok) return setErr(r.error ?? "No se pudo ingresar.");
          alEntrar(r.quien as { nombre: string });
        }}
        className="w-full rounded-pill bg-lumy-gradient py-3 font-semibold text-white shadow-soft"
      >
        Entrar
      </button>
    </div>
  );
}
