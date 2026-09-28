/**
 * Carga inicial de las 150 cuentas de participantes.
 *
 * Se ejecuta UNA sola vez, desde tu computadora, nunca desde la aplicacion.
 * Necesita la clave service_role, que no debe subirse a GitHub ni compartirse.
 *
 * Uso (Windows CMD):
 *   set SUPABASE_URL=https://xxxx.supabase.co
 *   set SUPABASE_SERVICE_KEY=eyJ...
 *   node scripts/crear-participantes.mjs
 *
 * Al terminar imprime un resumen. Los codigos quedan con la clave inicial
 * comun y con clave_cambiada en false, de modo que la aplicacion obligue a
 * cada participante a definir la suya en el primer ingreso.
 */

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;
const CLAVE_INICIAL = "Lumy2026";
const DESDE = 1;
const HASTA = 150;

if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en las variables de entorno.");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const codigo = (n) => `LMY-${String(n).padStart(4, "0")}`;
const correo = (c) => `${c.toLowerCase().replace("-", "")}@bienestar.interno`;

let creados = 0;
let existentes = 0;
let fallidos = [];

for (let n = DESDE; n <= HASTA; n++) {
  const cod = codigo(n);

  const { data, error } = await admin.auth.admin.createUser({
    email: correo(cod),
    password: CLAVE_INICIAL,
    email_confirm: true,
    user_metadata: { codigo: cod },
  });

  let uid = data?.user?.id;

  if (error) {
    if (!String(error.message).toLowerCase().includes("already")) {
      fallidos.push({ cod, error: error.message });
      continue;
    }
    // La cuenta ya existia. Aun asi puede faltarle la ficha, asi que la
    // buscamos y seguimos: saltarla fue justamente el error de la primera
    // version de este script.
    existentes++;
    const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    uid = lista?.users?.find((u) => u.email === correo(cod))?.id;
    if (!uid) {
      fallidos.push({ cod, error: "cuenta existente pero no encontrada" });
      continue;
    }
  }

  const { error: e2 } = await admin.from("participantes").upsert({
    id: uid,
    codigo: cod,
    grupo: "experimental",
    clave_cambiada: false,
    estado: "activa",
    dia_actual: 1,
  }, { onConflict: "id" });

  if (e2) fallidos.push({ cod, error: e2.message });
  else if (!error) creados++;

  if (n % 25 === 0) console.log(`  ... ${n} de ${HASTA}`);
}

console.log("");
console.log(`Creados:    ${creados}`);
console.log(`Ya existian: ${existentes}`);
console.log(`Fallidos:   ${fallidos.length}`);
if (fallidos.length) console.table(fallidos);
console.log("");
console.log(`Clave inicial de todas: ${CLAVE_INICIAL}`);
console.log("La aplicacion obliga a cambiarla en el primer ingreso.");
