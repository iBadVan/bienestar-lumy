/** @type {import('next').NextConfig} */

// CAPACITOR=1 genera la version que va dentro del APK.
const esApp = process.env.CAPACITOR === "1";

// El truco esta aqui. El panel y la ruta de restablecimiento se llaman
// "page.web.tsx" y "route.web.ts". En la web se reconocen ambas extensiones,
// asi que existen. En la app solo se reconoce ".tsx" y ".ts", de modo que Next
// simplemente no las ve y no intenta construirlas.
//
// Antes esto se resolvia moviendo carpetas durante la compilacion, lo que en
// Windows fallaba si el editor o el servidor las tenian abiertas.
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: esApp
    ? ["tsx", "ts"]
    : ["web.tsx", "web.ts", "tsx", "ts"],
  ...(esApp
    ? {
        output: "export",
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_ES_APP: "1" },
      }
    : {}),
};

export default nextConfig;
