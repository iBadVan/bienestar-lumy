/** @type {import('next').NextConfig} */

// CAPACITOR=1 genera la version que va dentro del APK: archivos estaticos,
// sin panel ni rutas de servidor. Sin esa variable se construye la web normal
// para Vercel, que si los incluye.
const esApp = process.env.CAPACITOR === "1";

const nextConfig = {
  reactStrictMode: true,
  ...(esApp
    ? {
        output: "export",
        images: { unoptimized: true },
        env: { NEXT_PUBLIC_ES_APP: "1" },
      }
    : {}),
};

export default nextConfig;
