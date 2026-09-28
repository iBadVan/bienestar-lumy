"use client";

import { DIAS_TOTALES } from "./config";
import { sb } from "./datos";

/**
 * Consultas del panel. Todas pasan por las policies: si quien pregunta no
 * figura en la tabla investigadoras, no recibe nada. Eso no es un error de la
 * app, es la proteccion funcionando.
 */

export type FilaParticipante = {
  id: string;
  codigo: string;
  edad: number | null;
  sexo: string | null;
  grado: string | null;
  estado: string;
  dia_actual: number;
  ultimo_ingreso: string | null;
  dias_completados: number;
  avance: number;
};

export type FilaAlerta = {
  id: string;
  dia: number;
  categoria: string;
  categoria_num: number;
  prioridad_auto: number;
  prioridad_final: number | null;
  estado: string;
  observacion: string | null;
  extracto: string;
  ocurrido_en: string;
  recibido_en: string;
  revisada_en: string | null;
  codigo?: string;
};

/* ------------------------------------------------------------- identidad -- */

export async function sesionInvestigadora() {
  const c = sb();
  if (!c) return null;
  const { data } = await c.auth.getUser();
  if (!data.user) return null;
  const { data: fila } = await c
    .from("investigadoras")
    .select("nombre, correo")
    .eq("id", data.user.id)
    .maybeSingle();
  return fila ? { ...fila, id: data.user.id } : null;
}

export async function ingresarInvestigadora(correo: string, clave: string) {
  const c = sb();
  if (!c) return { ok: false, error: "Supabase no esta configurado." };
  const { error } = await c.auth.signInWithPassword({ email: correo, password: clave });
  if (error) return { ok: false, error: "Correo o contrasena incorrectos." };
  const quien = await sesionInvestigadora();
  if (!quien) {
    await c.auth.signOut();
    return { ok: false, error: "Esta cuenta no esta registrada como investigadora." };
  }
  return { ok: true, quien };
}

/* ------------------------------------------------------------ consultas -- */

export async function cargarParticipantes(): Promise<FilaParticipante[]> {
  const c = sb();
  if (!c) return [];

  const { data: personas } = await c
    .from("participantes")
    .select("id, codigo, edad, sexo, grado, estado, dia_actual, ultimo_ingreso")
    .order("codigo");

  const { data: hechos } = await c.from("actividades_completadas").select("participante");

  const conteo = new Map<string, number>();
  (hechos ?? []).forEach((f: { participante: string }) => {
    conteo.set(f.participante, (conteo.get(f.participante) ?? 0) + 1);
  });

  return (personas ?? []).map((p) => {
    const n = conteo.get(p.id) ?? 0;
    return { ...p, dias_completados: n, avance: Math.round((n / DIAS_TOTALES) * 100) };
  });
}

export async function cargarAlertas(): Promise<FilaAlerta[]> {
  const c = sb();
  if (!c) return [];
  const { data } = await c
    .from("alertas")
    .select("*, participantes(codigo)")
    .order("recibido_en", { ascending: false })
    .limit(200);

  return (data ?? []).map((a: FilaAlerta & { participantes?: { codigo: string } }) => ({
    ...a,
    codigo: a.participantes?.codigo ?? "",
  }));
}

export async function revisarAlerta(
  id: string,
  cambios: { prioridad_final?: number; estado?: string; observacion?: string },
) {
  const c = sb();
  if (!c) return false;
  const quien = await sesionInvestigadora();
  const { error } = await c
    .from("alertas")
    .update({ ...cambios, revisada_en: new Date().toISOString(), revisada_por: quien?.id })
    .eq("id", id);
  return !error;
}

/* ---------------------------------------------------------- exportacion -- */

const comilla = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * D1: datos crudos por registro, sin nombres, para procesar en SPSS.
 * Se agrega el retraso de sincronizacion, que sirve para el analisis de
 * adherencia y para auditar el protocolo de alertas.
 */
export async function exportar(tabla: string): Promise<string> {
  const c = sb();
  if (!c) return "";

  const { data } = await c.from(tabla).select("*, participantes(codigo)").limit(20000);
  const filas = (data ?? []) as Array<Record<string, unknown> & { participantes?: { codigo: string } }>;
  if (filas.length === 0) return "sin datos";

  const normalizadas = filas.map((f) => {
    const { participantes, participante, ...resto } = f;
    const fila: Record<string, unknown> = { codigo: participantes?.codigo ?? "", ...resto };
    if (typeof f.ocurrido_en === "string" && typeof f.recibido_en === "string") {
      const ms = new Date(f.recibido_en).getTime() - new Date(f.ocurrido_en).getTime();
      fila.retraso_minutos = Math.round(ms / 60000);
    }
    return fila;
  });

  const columnas = Object.keys(normalizadas[0]);
  return [
    columnas.join(","),
    ...normalizadas.map((f) => columnas.map((k) => comilla(f[k])).join(",")),
  ].join("\n");
}

export function descargarCSV(nombre: string, contenido: string) {
  const blob = new Blob(["\ufeff" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
