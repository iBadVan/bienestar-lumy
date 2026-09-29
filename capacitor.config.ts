import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "pe.ucsm.bienestar",
  appName: "Bienestar",
  webDir: "out",
  android: {
    // La app guarda datos en el dispositivo y los envia despues.
    // Sin esto el contenido local no sobrevive entre sesiones.
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#FFF0F7",
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_lumy",
      iconColor: "#F06BB0",
    },
  },
};

export default config;
