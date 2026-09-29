"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Afiche } from "@/components/Afiche";
import { Boton, Burbuja, Cabecera, Lumy, Pantalla, Tarjeta, inputCls } from "@/components/ui";
import {
  AFIRMACIONES,
  DIAS_TOTALES,
  MODULOS,
  PREGUNTAS_CIERRE,
  PUNTOS_DIA,
  PUNTOS_POR_PREGUNTA,
  QUIZ,
  aficheDe,
} from "@/lib/config";
import { encolar, guardarDia } from "@/lib/datos";
import { cancelarInsistenciaDeHoy } from "@/lib/notificaciones";
import { PRIORIDAD_APOYO, analizar } from "@/lib/riesgo";
import { completarDia, hecho, semanaDe, tipoDia, useStore } from "@/lib/store";

/* ------------------------------------------------------------------ quiz -- */

function Quiz({ modulo, onFin }: { modulo: string; onFin: (p: number, t: number) => void }) {
  const preguntas = QUIZ[modulo as keyof typeof QUIZ] ?? [];
  const [i, setI] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);

  if (i >= preguntas.length) return null;
  const p = preguntas[i];

  function responder(idx: number) {
    if (elegida !== null) return;
    setElegida(idx);
    const ok = idx === p.c;
    const nuevo = ok ? puntaje + PUNTOS_POR_PREGUNTA : puntaje;
    if (ok) setPuntaje(nuevo);
    setTimeout(() => {
      setElegida(null);
      if (i + 1 >= preguntas.length) onFin(nuevo, preguntas.length * PUNTOS_POR_PREGUNTA);
      else setI(i + 1);
    }, 1400);
  }

  return (
    <div className="mb-5">
      <p className="mb-1 text-xs text-lumy-tintaSuave">
        Pregunta {i + 1} de {preguntas.length}
      </p>
      <p className="mb-3 font-medium">{p.q}</p>
      {p.o.map((o, idx) => {
        let cls = "border-lumy-linea bg-white";
        if (elegida !== null && idx === p.c) cls = "border-emerald-400 bg-emerald-50";
        else if (elegida === idx) cls = "border-red-300 bg-red-50";
        return (
          <button
            key={idx}
            onClick={() => responder(idx)}
            className={`mb-2 block w-full rounded-2xl border px-4 py-3 text-left text-sm shadow-card transition ${cls}`}
          >
            {o}
          </button>
        );
      })}
      {elegida !== null && (
        <p className="mt-2 rounded-2xl bg-lumy-nube px-4 py-3 text-sm">
          {elegida === p.c ? "Correcto." : `La respuesta correcta era: ${p.o[p.c]}`}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- diario -- */

function Diario({
  etiqueta,
  onGuardar,
}: {
  etiqueta: string;
  onGuardar: (texto: string) => void;
}) {
  const [txt, setTxt] = useState("");
  const [err, setErr] = useState("");

  return (
    <>
      <label className="mb-1.5 block text-xs text-lumy-tintaSuave">{etiqueta}</label>
      <textarea
        className={`${inputCls} mb-1 min-h-[150px] resize-y leading-relaxed`}
        placeholder="Escribe aquí..."
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
      />
      <p className="mb-3 text-[0.7rem] text-lumy-tintaSuave">
        Una vez guardado no se puede editar ni borrar, pero puedes añadir otro texto.
      </p>
      {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
      <Boton
        onClick={() => {
          if (txt.trim().length < 3) return setErr("Escribe al menos unas palabras antes de guardar.");
          onGuardar(txt.trim());
        }}
      >
        Guardar y terminar el día
      </Boton>
    </>
  );
}

/* ------------------------------------------------------------- temporizador */

function Temporizador({ minutos }: { minutos: number }) {
  const [seg, setSeg] = useState(minutos * 60);
  useEffect(() => {
    const t = setInterval(() => setSeg((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="mb-3 text-center font-display text-3xl font-bold tabular-nums text-lumy-fucsia">
      {String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")}
    </p>
  );
}

type Cierre = { tipo: "riesgo" | "insignia" | "dia"; dato?: string };

/* --------------------------------------------------------------- pantalla - */

export default function Actividad() {
  const { s, set, listo } = useStore();
  const router = useRouter();
  const [fin, setFin] = useState<Cierre | null>(null);
  const [quizListo, setQuizListo] = useState(false);
  const [puntajeQuiz, setPuntajeQuiz] = useState<{ p: number; t: number } | null>(null);

  useEffect(() => {
    if (listo && !s.perfil) router.replace("/");
  }, [listo, s.perfil, router]);

  if (!listo || !s.perfil) return null;

  const tipo = tipoDia(s.dia);
  const mod = MODULOS[tipo];
  const tieneQuiz = tipo === "psicoeducacion" || tipo === "manifestaciones";

  function terminar(texto?: string) {
    let resultado: Cierre = { tipo: "dia" };

    set((e) => {
      if (texto) {
        e.diario.push({ dia: e.dia, tipo, texto, fecha: new Date().toISOString() });
        encolar("entradas_diario", { dia: e.dia, modulo: tipo, texto });
        const hit = analizar(texto);
        if (hit) {
          e.alertas.push({
            id: `${e.dia}-${Date.now()}`,
            codigo: e.perfil!.codigo,
            dia: e.dia,
            categoria: hit.categoria,
            prioridad: hit.prioridad,
            estado: "pendiente",
            observacion: "",
            extracto: texto.slice(0, 200),
            fecha: new Date().toISOString(),
          });
          encolar("alertas", {
            dia: e.dia,
            categoria: hit.categoria,
            categoria_num: hit.cat,
            prioridad_auto: hit.prioridad,
            extracto: texto.slice(0, 200),
          });
          if (hit.prioridad >= PRIORIDAD_APOYO) resultado = { tipo: "riesgo" };
        }
      }
      if (puntajeQuiz) {
        e.quizes.push({ dia: e.dia, modulo: tipo, puntaje: puntajeQuiz.p, total: puntajeQuiz.t });
        encolar("resultados_quiz", {
          dia: e.dia, modulo: tipo, puntaje: puntajeQuiz.p, total: puntajeQuiz.t,
        });
      }
      const insignia = completarDia(e);
      encolar("actividades_completadas", { dia: e.dia, modulo: tipo });
      if (insignia) encolar("insignias_obtenidas", { insignia: insignia.nombre, obtenida_en: new Date().toISOString() });
      if (insignia && resultado.tipo === "dia") resultado = { tipo: "insignia", dato: insignia.nombre };
      return e;
    });

    void cancelarInsistenciaDeHoy();
    if (s.perfil) void guardarDia(s.perfil.codigo, Math.min(DIAS_TOTALES, s.dia + 1));
    setFin(resultado);
  }

  /* pantallas de cierre del día */

  if (fin?.tipo === "riesgo") {
    return (
      <Pantalla>
        <div className="flex flex-1 flex-col justify-center">
          <Lumy size={120} expresion="preocupada" />
          <div className="my-5">
            <Burbuja>Gracias por escribir esto. Leerlo me importa, y no quiero que lo cargues sola.</Burbuja>
          </div>
          <div className="mb-5 rounded-card border-2 border-red-300 bg-red-50 p-4">
            <b className="mb-1 block text-sm">Si en este momento sientes que puedes hacerte daño</b>
            <p className="text-sm leading-relaxed">
              Llama a la <b>Línea 113, opción 5</b>. Atiende salud mental, es gratuita y funciona todos
              los días a toda hora.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              También puedes escribir a las investigadoras del estudio o buscar ahora mismo a un adulto
              de confianza.
            </p>
          </div>
          <p className="mb-4 text-center text-xs text-lumy-tintaSuave">
            Tu texto se guardó y el equipo de investigación lo va a revisar.
          </p>
          <Boton href="/app">Continuar</Boton>
        </div>
      </Pantalla>
    );
  }

  if (fin?.tipo === "insignia" || fin?.tipo === "dia") {
    const esInsignia = fin.tipo === "insignia";
    return (
      <Pantalla>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Lumy size={112} expresion={esInsignia ? "emocionada" : "feliz"} />
          <h1 className="mt-4 font-display text-2xl font-bold">
            {esInsignia ? fin.dato : `Día ${s.dia} completo`}
          </h1>
          <p className="mb-8 mt-1 text-sm text-lumy-tintaSuave">
            {esInsignia
              ? "Llegaste hasta aquí sin dejarlo. Eso no es poca cosa."
              : `Ganaste ${PUNTOS_DIA} puntos. Nos vemos mañana.`}
          </p>
          <div className="w-full">
            <Boton href="/app">Volver al inicio</Boton>
          </div>
        </div>
      </Pantalla>
    );
  }

  /* contenido de la actividad */

  return (
    <Pantalla>
      <Cabecera titulo={`Día ${s.dia} · ${mod.nombre}`} volver="/app" />
      <h1 className="font-display text-2xl font-bold">
        {mod.ico}{" "}
        {tipo === "psicoeducacion" || tipo === "manifestaciones"
          ? aficheDe(semanaDe(s.dia), tipo).titulo
          : mod.nombre}
      </h1>
      <p className="mb-5 text-sm text-lumy-tintaSuave">{mod.intro}</p>

      {hecho(s, s.dia) && (
        <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ya completaste este día. Puedes repetir la actividad cuando quieras.
        </p>
      )}

      {(tipo === "psicoeducacion" || tipo === "manifestaciones") && (
        <Afiche {...aficheDe(semanaDe(s.dia), tipo)} />
      )}

      {(tipo === "respiracion" || tipo === "mindfulness") && (
        <>
          <Tarjeta className="mb-4 bg-lumy-nube text-center">
            <b className="block font-display">
              {tipo === "respiracion" ? "Video guiado por Lumy" : "Audio de 5 minutos"}
            </b>
            <p className="mt-1 text-xs text-lumy-tintaSuave">
              {tipo === "respiracion"
                ? "Respiración diafragmática de 5 a 10 minutos. Pendiente de entrega."
                : "Mindfulness guiado. Pendiente de entrega."}
            </p>
          </Tarjeta>
          <div className="mb-3">
            <Boton href="/app/respirar" variante="azul">
              Practicar con el temporizador
            </Boton>
          </div>
        </>
      )}

      {tipo === "escritura" && <Temporizador minutos={20} />}

      {tipo === "afirmaciones" &&
        AFIRMACIONES.map((a) => (
          <p
            key={a}
            className="mb-2 rounded-r-2xl border-l-4 border-lumy-rosa bg-white px-4 py-3 font-display text-[1.02rem] shadow-card"
          >
            {a}
          </p>
        ))}

      {tieneQuiz && !quizListo && (
        <>
          <h2 className="mb-2 font-display text-base font-semibold">Comprueba lo que entendiste</h2>
          <Quiz
            modulo={tipo}
            onFin={(p, t) => {
              setPuntajeQuiz({ p, t });
              setQuizListo(true);
            }}
          />
        </>
      )}

      {tieneQuiz && quizListo && puntajeQuiz && (
        <p className="mb-4 rounded-2xl bg-lumy-nube px-4 py-3 text-sm">
          Obtuviste {puntajeQuiz.p} de {puntajeQuiz.t} puntos. Este puntaje se guarda aparte de tus
          puntos de participación.
        </p>
      )}

      {tipo === "cierre" ? (
        <PreguntasCierre onFin={() => terminar()} />
      ) : (!tieneQuiz || quizListo) ? (
        <Diario
          etiqueta={tipo === "escritura" ? "Tu escritura de hoy" : "Mi diario de hoy"}
          onGuardar={(t) => terminar(t)}
        />
      ) : null}
    </Pantalla>
  );
}

function PreguntasCierre({ onFin }: { onFin: () => void }) {
  const { set } = useStore();
  const [r, setR] = useState<Record<string, string>>({});

  return (
    <>
      {PREGUNTAS_CIERRE.map((q, i) => (
        <label key={i} className="mb-3 block">
          <span className="mb-1.5 block text-xs text-lumy-tintaSuave">{q}</span>
          <textarea
            className={`${inputCls} min-h-[64px] resize-y`}
            value={r[`q${i}`] ?? ""}
            onChange={(e) => setR((p) => ({ ...p, [`q${i}`]: e.target.value }))}
          />
        </label>
      ))}
      <Boton
        onClick={() => {
          set((e) => {
            e.cierre = { ...e.cierre, ...r };
            return e;
          });
          onFin();
        }}
      >
        Enviar mis comentarios
      </Boton>
    </>
  );
}
