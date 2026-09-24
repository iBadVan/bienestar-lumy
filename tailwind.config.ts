import type { Config } from "tailwindcss";

/**
 * Paleta tomada del prototipo en Figma de las investigadoras.
 * Si cambian el diseño, este archivo es el único lugar que hay que tocar.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lumy: {
          rosa: "#F06BB0",
          fucsia: "#E8459B",
          lila: "#A855F7",
          morado: "#7C3AED",
          azul: "#5B9BF8",
          azulOscuro: "#3B7DE0",
          crema: "#FFF6FA",
          nube: "#FDEFF6",
          tinta: "#3A2B45",
          tintaSuave: "#8A7A94",
          linea: "#F3E2EE",
        },
        emo: {
          feliz: "#FEF3C7",
          tranquilo: "#D8F3EC",
          neutral: "#E5E7F5",
          ansioso: "#FFE8CC",
          triste: "#DCEAFB",
          estresado: "#FBDDE3",
        },
      },
      fontFamily: {
        display: ["Quicksand", "system-ui", "sans-serif"],
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.35rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 10px 28px -18px rgba(124, 58, 237, 0.45)",
        card: "0 4px 18px -12px rgba(58, 43, 69, 0.28)",
      },
      backgroundImage: {
        "lumy-gradient": "linear-gradient(135deg, #F06BB0 0%, #A855F7 100%)",
        "lumy-soft": "linear-gradient(160deg, #FFF0F7 0%, #F6EDFD 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
