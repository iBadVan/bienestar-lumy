/**
 * Genera los codigos de acceso que se reparten a las participantes.
 *
 * Son aleatorios a proposito: con codigos consecutivos, cualquiera podia
 * probar el de una companera. El alfabeto excluye los caracteres que se
 * confunden al leer en papel (cero y O, uno y I, L).
 *
 * Deja un CSV listo para imprimir y recortar.
 *
 * Uso (Windows):
 *   set SUPABASE_URL=https://xxxx.supabase.co
 *   set SUPABASE_SERVICE_KEY=sb_secret_...
 *   node scripts/generar-codigos.mjs 150
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;
const CANTIDAD = Number(process.argv[2] ?? 150);

if (!URL || !SERVICE) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY.");
  process.exit(1);
}
if (SERVICE.startsWith("sb_publishable_")) {
  console.error("SUPABASE_SERVICE_KEY tiene la clave publica. Debe ser la que empieza con sb_secret_.");
  process.exit(1);
}

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin I, L, O, 0, 1

function nuevoCodigo() {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `LMY-${s}`;
}

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const codigos = new Set();
while (codigos.size < CANTIDAD) codigos.add(nuevoCodigo());
const lista = [...codigos];

const { error } = await admin
  .from("codigos_acceso")
  .insert(lista.map((codigo) => ({ codigo })));

if (error) {
  console.error("No se pudieron guardar los codigos:", error.message);
  process.exit(1);
}

const archivo = "codigos-para-repartir.csv";
writeFileSync(
  archivo,
  "\ufeff" + ["n,codigo_de_acceso"].concat(lista.map((c, i) => `${i + 1},${c}`)).join("\n"),
  "utf8",
);

console.log("");
console.log(`${lista.length} codigos generados y guardados.`);
console.log(`Archivo para imprimir: ${archivo}`);
console.log("");
console.log("Ejemplos:", lista.slice(0, 5).join("  "));
console.log("");
console.log("IMPORTANTE: cada codigo sirve una sola vez. Al registrarse, el");
console.log("sistema le asigna automaticamente su numero correlativo del");
console.log("estudio (LMY-0001 en adelante) segun el orden de llegada.");
