"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Capa de datos.
 *
 * La aplicacion es local primero: todo se guarda en el dispositivo y despues se
 * envia al servidor. Esto responde a la Alternativa 1 elegida por el equipo de
 * investigacion, y tiene un efecto util: si las credenciales de Supabase no
 * estan configuradas, la aplicacion sigue funcionando igual, solo que sin
 * sincronizar. Asi la demo nunca se rompe.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const haySupabase = Boolean(URL && ANON);

let cliente: SupabaseClient | null = null;
export function sb(): SupabaseClient | null {
  if (!haySupabase) return null;
  if (!cliente) {
    cliente = createClient(URL!, ANON!, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "bienestar_auth" },
    });
  }
  return cliente;
}

/* ------------------------------------------------------------ identidad -- */

/**
 * Supabase Auth exige un correo y las participantes no tienen uno.
 * Cada codigo se traduce a una direccion interna que nunca se usa para enviar
 * nada: LMY-0001 pasa a ser lmy0001@bienestar.interno.
 */
export const codigoACorreo = (codigo: string) =>
  `${codigo.toLowerCase().replace("-", "")}@bienestar.interno`;

export async function iniciarSesion(codigo: string, clave: string) {
  const c = sb();
  if (!c) return { ok: true, local: true as const, claveCambiada: null };

  const { error } = await c.auth.signInWithPassword({
    email: codigoACorreo(codigo),
    password: clave,
  });
  if (error) return { ok: false, error: error.message, claveCambiada: null };

  // El servidor es quien sabe si ya cambio su clave. Lo que diga el navegador
  // no cuenta: puede venir de otra sesion o de una prueba anterior.
  const { data: fila } = await c
    .from("participantes")
    .select("clave_cambiada, dia_actual, estado, codigo_estudio")
    .eq("codigo", codigo)
    .single();

  await c.from("participantes").update({ ultimo_ingreso: new Date().toISOString() }).eq("codigo", codigo);

  return {
    ok: true,
    claveCambiada: fila?.clave_cambiada ?? false,
    diaActual: fila?.dia_actual ?? 1,
    estado: fila?.estado ?? "activa",
    codigoEstudio: fila?.codigo_estudio ?? null,
  };
}

export async function cambiarClaveRemota(nueva: string) {
  const c = sb();
  if (!c) return { ok: true };
  const { error } = await c.auth.updateUser({ password: nueva });
  if (error) return { ok: false, error: error.message };
  const { data } = await c.auth.getUser();
  if (data.user) await c.from("participantes").update({ clave_cambiada: true }).eq("id", data.user.id);
  return { ok: true };
}

/**
 * El dia de intervencion se calcula desde la base, no desde el celular.
 * Antes vivia en el navegador: si la participante reinstalaba la app o entraba
 * desde otro equipo, volvia al dia 1 y se perdia su avance.
 */
export async function diaDesdeServidor(codigo: string) {
  const c = sb();
  if (!c) return null;
  const { data } = await c
    .from("participantes")
    .select("dia_actual")
    .eq("codigo", codigo)
    .maybeSingle();
  return data?.dia_actual ?? null;
}

export async function guardarDia(codigo: string, dia: number) {
  const c = sb();
  if (!c) return;
  await c.from("participantes").update({ dia_actual: dia }).eq("codigo", codigo);
}

export async function cerrarSesion() {
  await sb()?.auth.signOut();
}

/** A7: si el celular es prestado, la sesion no debe quedar abierta sola. */
export async function hayParticipanteConectada() {
  const c = sb();
  if (!c) return false;
  const { data } = await c.auth.getSession();
  return Boolean(data.session);
}

/* --------------------------------------------------------------- outbox -- */

export type Pendiente = {
  id: string;
  tabla: string;
  fila: Record<string, unknown>;
  intentos: number;
  creado: string;
};

const CLAVE_OUTBOX = "bienestar_outbox";

function leerOutbox(): Pendiente[] {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE_OUTBOX) ?? "[]");
  } catch {
    return [];
  }
}

function escribirOutbox(lista: Pendiente[]) {
  try {
    window.localStorage.setItem(CLAVE_OUTBOX, JSON.stringify(lista));
  } catch {
    // sin almacenamiento la app sigue, solo que no podra reintentar
  }
}

/**
 * Deja una fila lista para enviarse. Se guarda siempre, haya o no conexion.
 * "ocurrido_en" es la hora del celular: es el dato que permite medir cuanto
 * tardo en llegar cada registro, incluida una alerta.
 */
export function encolar(tabla: string, fila: Record<string, unknown>) {
  const p: Pendiente = {
    id: `${tabla}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tabla,
    fila: { ocurrido_en: new Date().toISOString(), ...fila },
    intentos: 0,
    creado: new Date().toISOString(),
  };
  escribirOutbox([...leerOutbox(), p]);
  void sincronizar();
  return p.id;
}

export function pendientes() {
  return leerOutbox().length;
}

let sincronizando = false;

/** Envia lo pendiente. Lo que falle se queda en la cola para el proximo intento. */
export async function sincronizar(): Promise<{ enviados: number; quedan: number }> {
  const c = sb();
  const cola = leerOutbox();
  if (!c || sincronizando || cola.length === 0 || !navigator.onLine) {
    return { enviados: 0, quedan: cola.length };
  }

  sincronizando = true;
  let enviados = 0;
  const restantes: Pendiente[] = [];

  try {
    const { data } = await c.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return { enviados: 0, quedan: cola.length };

    for (const p of cola) {
      const { error } = await c.from(p.tabla).insert({ participante: uid, ...p.fila });
      // 23505 es clave duplicada: ya estaba enviado, se descarta sin reintentar
      if (!error || error.code === "23505") enviados++;
      else restantes.push({ ...p, intentos: p.intentos + 1 });
    }
    escribirOutbox(restantes);
  } finally {
    sincronizando = false;
  }

  return { enviados, quedan: restantes.length };
}

/** Reintenta al recuperar conexion y cada dos minutos. */
export function activarSincronizacion() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void sincronizar());
  window.setInterval(() => void sincronizar(), 120_000);
  void sincronizar();
}
