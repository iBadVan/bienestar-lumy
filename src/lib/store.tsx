"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { activarSincronizacion } from "./datos";
import {
  CICLO,
  DIAS_TOTALES,
  INSIGNIAS,
  PUNTOS_DIA,
  TipoModulo,
} from "./config";

/**
 * Fase 1: el estado vive en el navegador.
 * Fase 2: este mismo objeto se sincroniza contra Supabase. Las funciones de
 * abajo no cambian, solo su implementación interna.
 */

export type RegistroEmocion = { dia: number; emocion: string; fecha: string };
export type EntradaDiario = { dia: number; tipo: string; texto: string; fecha: string };
export type Alerta = {
  id: string;
  codigo: string;
  dia: number;
  categoria: string;
  prioridad: number;
  estado: "pendiente" | "en seguimiento" | "cerrada";
  observacion: string;
  extracto: string;
  fecha: string;
};
export type ResultadoQuiz = { dia: number; modulo: string; puntaje: number; total: number };

export type Perfil = {
  codigo: string;
  inicial: string;
  apellidos: string;
  edad: number | null;
  sexo: string;
  grado: string;
  viveConAmbosPadres: string;
};

export type Estado = {
  perfil: Perfil | null;
  claveCambiada: boolean;
  consentido: boolean;
  dia: number;
  completados: number[];
  puntos: number;
  insignias: string[];
  emociones: RegistroEmocion[];
  diario: EntradaDiario[];
  alertas: Alerta[];
  quizes: ResultadoQuiz[];
  cierre: Record<string, string>;
};

const inicial = (): Estado => ({
  perfil: null,
  claveCambiada: false,
  consentido: false,
  dia: 1,
  completados: [],
  puntos: 0,
  insignias: [],
  emociones: [],
  diario: [],
  alertas: [],
  quizes: [],
  cierre: {},
});

const KEY = "bienestar_lumy_v1";

type Ctx = {
  s: Estado;
  set: (f: (e: Estado) => Estado) => void;
  listo: boolean;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Estado>(inicial);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setS({ ...inicial(), ...JSON.parse(raw) });
    } catch {
      // primer uso, o almacenamiento bloqueado: seguimos en memoria
    }
    setListo(true);
    activarSincronizacion();
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      // sin almacenamiento la app sigue funcionando en memoria
    }
  }, [s, listo]);

  const set = (f: (e: Estado) => Estado) => setS((prev) => f(structuredClone(prev)));
  const value = useMemo(() => ({ s, set, listo }), [s, listo]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore debe usarse dentro de StoreProvider");
  return c;
}

/* ---------------------------------------------------------------- reglas -- */

export const tipoDia = (d: number): TipoModulo => (d >= 29 ? "cierre" : CICLO[(d - 1) % 7]);
export const semanaDe = (d: number) => Math.min(4, Math.ceil(d / 7));
export const hecho = (s: Estado, d: number) => s.completados.includes(d);

/** L2 y L3: se habilita el día actual y los anteriores pendientes, nunca uno futuro. */
export const disponible = (s: Estado, d: number) => d <= s.dia && !hecho(s, d);

export const emocionDe = (s: Estado, d: number) => s.emociones.filter((e) => e.dia === d);

export function racha(s: Estado) {
  let r = 0;
  for (let d = s.dia; d >= 1; d--) {
    if (hecho(s, d)) r++;
    else if (d < s.dia) break;
  }
  return r;
}

export function insigniasNuevas(s: Estado) {
  const n = s.completados.length;
  return INSIGNIAS.filter((b) => n >= b.dia && !s.insignias.includes(b.nombre));
}

/** Marca el día como completo y devuelve la insignia ganada, si hubo. */
export function completarDia(e: Estado) {
  if (hecho(e, e.dia)) return null;
  e.completados.push(e.dia);
  e.puntos = Math.min(DIAS_TOTALES * PUNTOS_DIA, e.puntos + PUNTOS_DIA);
  const nuevas = insigniasNuevas(e);
  nuevas.forEach((b) => e.insignias.push(b.nombre));
  return nuevas.length ? nuevas[nuevas.length - 1] : null;
}
