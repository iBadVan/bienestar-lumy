/**
 * Genera la version que va dentro del APK.
 *
 * El panel y la ruta de restablecimiento de contrasenas necesitan un servidor,
 * y dentro de la app no hay servidor. Se quedan fuera por el nombre de sus
 * archivos (page.web.tsx y route.web.ts), que la compilacion de la app no
 * reconoce. No se mueve ni se toca ninguna carpeta.
 *
 * Uso:  npm run apk
 */

import { execSync } from "node:child_process";

try {
  console.log("Construyendo la version de la app...");
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, CAPACITOR: "1" } });

  console.log("");
  console.log("Copiando al proyecto de Android...");
  execSync("npx cap sync android", { stdio: "inherit" });

  console.log("");
  console.log("Listo. Ahora:  npm run apk:abrir");
  console.log("Y en Android Studio: Build, Build Bundle(s) / APK(s), Build APK(s).");
} catch (e) {
  console.error("");
  console.error("Fallo la construccion:", e.message);
  process.exitCode = 1;
}
