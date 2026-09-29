"use client";

/**
 * Recordatorios diarios (O1 y O2).
 *
 * Dos avisos: 7:00 p. m. para hacer la actividad, y 9:00 p. m. solo por si no
 * la hizo. Se programan en el propio celular, asi que llegan aunque no haya
 * internet. Eso no se puede hacer desde una pagina web, es la razon principal
 * por la que la version instalable existe.
 *
 * En la web estas funciones no hacen nada y no rompen: se comprueba primero
 * que la app corra dentro del contenedor nativo.
 */

const ID_PRINCIPAL = 1001;
const ID_INSISTENCIA = 1002;

async function plugin() {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

export async function pedirPermisoNotificaciones() {
  const LN = await plugin();
  if (!LN) return false;
  const actual = await LN.checkPermissions();
  if (actual.display === "granted") return true;
  const pedido = await LN.requestPermissions();
  return pedido.display === "granted";
}

export async function programarRecordatorios() {
  const LN = await plugin();
  if (!LN) return;

  const permiso = await pedirPermisoNotificaciones();
  if (!permiso) return;

  // Se limpian antes para no acumular duplicados en cada ingreso.
  await LN.cancel({ notifications: [{ id: ID_PRINCIPAL }, { id: ID_INSISTENCIA }] });

  await LN.schedule({
    notifications: [
      {
        id: ID_PRINCIPAL,
        title: "Tu momento del día",
        body: "Lumy te espera para la actividad de hoy.",
        schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true },
      },
      {
        id: ID_INSISTENCIA,
        title: "¿Cómo te fue hoy?",
        body: "Todavía puedes registrar cómo te sentiste.",
        schedule: { on: { hour: 21, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
}

/** O1: si ya completó la actividad del día, el aviso de las 9 no debe llegar. */
export async function cancelarInsistenciaDeHoy() {
  const LN = await plugin();
  if (!LN) return;
  await LN.cancel({ notifications: [{ id: ID_INSISTENCIA }] });
  // Se vuelve a programar para mañana.
  await LN.schedule({
    notifications: [
      {
        id: ID_INSISTENCIA,
        title: "¿Cómo te fue hoy?",
        body: "Todavía puedes registrar cómo te sentiste.",
        schedule: { on: { hour: 21, minute: 0 }, allowWhileIdle: true },
      },
    ],
  });
}

export function esApp() {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}
