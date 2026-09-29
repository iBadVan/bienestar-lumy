/**
 * Genera la version que va dentro del APK.
 *
 * El panel y la ruta de restablecimiento de contrasenas necesitan un servidor,
 * y dentro de la app no hay servidor. Asi que se apartan durante la
 * construccion y se devuelven al terminar. El panel sigue viviendo en la web,
 * que es donde las investigadoras lo van a usar.
 *
 * Uso:  node scripts/construir-apk.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const raiz = process.cwd();
const apartar = [
  ["src/app/panel", "src/app/_panel.apartado"],
  ["src/app/api", "src/app/_api.apartado"],
];

function mover(de, a) {
  const origen = join(raiz, de);
  if (!existsSync(origen)) return;

  // En Windows, si el servidor de desarrollo esta corriendo, la carpeta queda
  // bloqueada y el renombrado falla. Se reintenta unas veces antes de rendirse.
  for (let intento = 1; intento <= 5; intento++) {
    try {
      renameSync(origen, join(raiz, a));
      return;
    } catch (e) {
      if (e.code !== "EPERM" && e.code !== "EBUSY") throw e;
      if (intento === 5) {
        console.error("");
        console.error("No se pudo apartar " + de + ".");
        console.error("Casi siempre es porque 'npm run dev' esta corriendo en otra ventana.");
        console.error("Cierra esa ventana (y VS Code si lo tienes abierto) y vuelve a intentar.");
        console.error("");
        throw e;
      }
      execSync("timeout /t 1 /nobreak > nul 2>&1 || sleep 1", { shell: true, stdio: "ignore" });
    }
  }
}

function devolverTodo() {
  for (const [normal, apartado] of apartar) {
    const guardado = join(raiz, apartado);
    if (existsSync(guardado)) renameSync(guardado, join(raiz, normal));
  }
}

try {
  console.log("Apartando el panel y las rutas de servidor...");
  for (const [normal, apartado] of apartar) mover(normal, apartado);

  console.log("Construyendo la version de la app...");
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, CAPACITOR: "1" } });

  console.log("Copiando al proyecto de Android...");
  try {
    execSync("npx cap sync android", { stdio: "inherit" });
  } catch {
    console.log("Aun no existe el proyecto de Android. Crealo con: npx cap add android");
  }

  console.log("");
  console.log("Listo. Ahora abre el proyecto en Android Studio:");
  console.log("  npx cap open android");
  console.log("");
  console.log("Y ahi: Build, Build Bundle(s) / APK(s), Build APK(s).");
} catch (e) {
  console.error("");
  console.error("Fallo la construccion:", e.message);
  process.exitCode = 1;
} finally {
  console.log("Devolviendo el panel a su lugar...");
  devolverTodo();
}
