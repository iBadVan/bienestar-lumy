"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Boton fisico de atras.
 *
 * Sin esto, Android cierra la aplicacion de golpe en cualquier pantalla, que
 * es lo primero que va a tocar una adolescente. Aqui se define a donde vuelve
 * cada pantalla, y solo en el inicio se permite salir, preguntando antes.
 */

const VOLVER_A: Record<string, string> = {
  "/consentimiento": "/",
  "/ingreso": "/consentimiento",
  "/login": "/ingreso",
  "/registro": "/ingreso",
  "/clave": "/login",
  "/app/emocion": "/app",
  "/app/apoyo": "/app",
  "/app/respirar": "/app",
  "/app/actividad": "/app",
};

export function BotonAtras() {
  const router = useRouter();
  const ruta = usePathname();

  useEffect(() => {
    let quitar: (() => void) | undefined;

    (async () => {
      if (typeof window === "undefined") return;
      const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
        .Capacitor;
      if (!cap?.isNativePlatform?.()) return;

      const { App } = await import("@capacitor/app");

      const escucha = await App.addListener("backButton", ({ canGoBack }) => {
        const destino = VOLVER_A[ruta];

        if (destino) {
          router.push(destino);
          return;
        }

        // En la pantalla principal de la estudiante no se retrocede al login:
        // se pregunta si quiere salir.
        if (ruta === "/app" || ruta === "/") {
          const salir = window.confirm("¿Quieres salir de la aplicación?");
          if (salir) void App.exitApp();
          return;
        }

        if (canGoBack) window.history.back();
        else void App.exitApp();
      });

      quitar = () => void escucha.remove();
    })();

    return () => quitar?.();
  }, [ruta, router]);

  return null;
}
