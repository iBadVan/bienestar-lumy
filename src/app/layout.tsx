import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BotonAtras } from "@/components/BotonAtras";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Bienestar",
  description: "Tu espacio para crecer, sentir y avanzar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F06BB0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <StoreProvider>
          <BotonAtras />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
