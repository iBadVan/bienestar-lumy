import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Restablecimiento de contrasena de una participante (F6).
 *
 * Esto corre en el servidor, nunca en el navegador, porque necesita la clave
 * de servicio. Dos comprobaciones antes de tocar nada:
 *   1. Quien pide debe tener sesion valida.
 *   2. Esa sesion debe pertenecer a alguien de la tabla investigadoras.
 *
 * Devuelve una clave temporal que la investigadora le dicta a la participante.
 * Como deja clave_cambiada en false, la aplicacion la obliga a definir una
 * propia en cuanto entre.
 */

export const runtime = "nodejs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;

function claveTemporal() {
  return "Lumy" + Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req: Request) {
  // Diagnostico claro en vez de un "no autorizado" que no dice nada.
  if (!URL) {
    return NextResponse.json({ error: "Falta NEXT_PUBLIC_SUPABASE_URL en el servidor." }, { status: 500 });
  }
  if (!SERVICE) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_KEY en el servidor. Agregala en Vercel y vuelve a desplegar." },
      { status: 500 },
    );
  }
  if (SERVICE.startsWith("sb_publishable_") || SERVICE.startsWith("sb_public")) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_KEY tiene la clave publica. Debe ser la secreta, la que empieza con sb_secret_.",
      },
      { status: 500 },
    );
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Falta la sesion." }, { status: 401 });
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. La sesion es valida
  const { data: quien, error: errAuth } = await admin.auth.getUser(token);
  if (errAuth || !quien.user) {
    return NextResponse.json({ error: "Sesion invalida." }, { status: 401 });
  }

  // 2. Quien pide es investigadora
  const { data: inv, error: errInv } = await admin
    .from("investigadoras")
    .select("id, nombre")
    .eq("id", quien.user.id)
    .maybeSingle();

  if (errInv) {
    return NextResponse.json(
      { error: `El servidor no pudo leer la tabla investigadoras: ${errInv.message}` },
      { status: 500 },
    );
  }

  if (!inv) {
    return NextResponse.json(
      {
        error:
          `Tu cuenta (${quien.user.id}) no figura en la tabla investigadoras, ` +
          "o el servidor esta consultando sin permisos. Revisa SUPABASE_SERVICE_KEY.",
      },
      { status: 403 },
    );
  }

  const { codigo } = (await req.json()) as { codigo?: string };
  if (!codigo || !/^LMY-\d{4}$/.test(codigo)) {
    return NextResponse.json({ error: "Codigo invalido." }, { status: 400 });
  }

  const { data: participante } = await admin
    .from("participantes")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();

  if (!participante) {
    return NextResponse.json({ error: "No existe esa participante." }, { status: 404 });
  }

  const nueva = claveTemporal();

  const { error: errPwd } = await admin.auth.admin.updateUserById(participante.id, {
    password: nueva,
  });
  if (errPwd) {
    return NextResponse.json({ error: "No se pudo cambiar la contrasena." }, { status: 500 });
  }

  // Al quedar en false, la aplicacion la obliga a definir una propia.
  await admin.from("participantes").update({ clave_cambiada: false }).eq("id", participante.id);

  return NextResponse.json({ ok: true, codigo, clave: nueva, por: inv.nombre });
}
