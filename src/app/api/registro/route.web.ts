import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Registro de una participante.
 *
 * Corre en el servidor porque necesita crear la cuenta y marcar el codigo como
 * usado, y ninguna de las dos cosas puede quedar en manos del navegador.
 *
 * La comprobacion importante: el codigo debe existir y no haber sido usado.
 * Eso impide que alguien invente un codigo o que dos personas se registren con
 * el mismo, que era el riesgo del registro libre.
 */

export const runtime = "nodejs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;

const correoInterno = (codigo: string) =>
  `${codigo.toLowerCase().replace("-", "")}@bienestar.interno`;

type Cuerpo = {
  codigo?: string;
  clave?: string;
  inicial?: string;
  apellidos?: string;
  edad?: number;
  sexo?: string;
  grado?: string;
  viveConAmbosPadres?: string;
};

export async function POST(req: Request) {
  if (!URL || !SERVICE) {
    return NextResponse.json({ error: "Servidor sin configurar." }, { status: 500 });
  }

  const b = (await req.json()) as Cuerpo;
  const codigo = (b.codigo ?? "").trim().toUpperCase();

  if (!/^LMY-[A-Z0-9]{5}$/.test(codigo)) {
    return NextResponse.json({ error: "El código no tiene el formato correcto." }, { status: 400 });
  }
  if (!b.clave || b.clave.length < 6) {
    return NextResponse.json({ error: "La contraseña necesita al menos 6 caracteres." }, { status: 400 });
  }
  if (!b.edad || b.edad < 12 || b.edad > 17) {
    return NextResponse.json({ error: "La edad debe estar entre 12 y 17 años." }, { status: 400 });
  }
  if (!b.inicial || !b.apellidos || !b.sexo || !b.grado || !b.viveConAmbosPadres) {
    return NextResponse.json({ error: "Faltan datos por completar." }, { status: 400 });
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. El código existe y sigue libre
  const { data: fila } = await admin
    .from("codigos_acceso")
    .select("codigo, usado")
    .eq("codigo", codigo)
    .maybeSingle();

  if (!fila) {
    return NextResponse.json(
      { error: "Ese código no existe. Revisa que lo hayas escrito bien." },
      { status: 404 },
    );
  }
  if (fila.usado) {
    return NextResponse.json(
      { error: "Ese código ya fue usado. Si crees que es un error, avisa a las investigadoras." },
      { status: 409 },
    );
  }

  // 2. Cuenta de acceso
  const { data: cuenta, error: errCuenta } = await admin.auth.admin.createUser({
    email: correoInterno(codigo),
    password: b.clave,
    email_confirm: true,
    user_metadata: { codigo_acceso: codigo },
  });

  if (errCuenta || !cuenta.user) {
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }

  // 3. Correlativo del estudio, por orden de registro
  const { data: correlativo } = await admin.rpc("siguiente_codigo_estudio");

  const { error: errFicha } = await admin.from("participantes").insert({
    id: cuenta.user.id,
    codigo,
    codigo_acceso: codigo,
    codigo_estudio: correlativo,
    inicial: b.inicial.trim().toUpperCase().slice(0, 1),
    apellidos: b.apellidos.trim(),
    edad: b.edad,
    sexo: b.sexo,
    grado: b.grado,
    vive_ambos_padres: b.viveConAmbosPadres === "si",
    clave_cambiada: true, // la eligio ella misma, no hay clave comun que cambiar
    estado: "activa",
    dia_actual: 1,
    registrado_en: new Date().toISOString(),
  });

  if (errFicha) {
    // Si la ficha falla, la cuenta no debe quedar suelta.
    await admin.auth.admin.deleteUser(cuenta.user.id);
    return NextResponse.json(
      { error: `No se pudo guardar tu registro: ${errFicha.message}` },
      { status: 500 },
    );
  }

  // 4. El código queda quemado
  await admin
    .from("codigos_acceso")
    .update({ usado: true, usado_por: cuenta.user.id, usado_en: new Date().toISOString() })
    .eq("codigo", codigo);

  return NextResponse.json({ ok: true, codigoEstudio: correlativo });
}
