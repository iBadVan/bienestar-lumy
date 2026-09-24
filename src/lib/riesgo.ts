/**
 * Detección preventiva de expresiones de riesgo en el diario (M1, M2).
 *
 * ADVERTENCIA IMPORTANTE
 * Esta lista es una adaptación reducida de las 12 categorías que entregaron
 * las investigadoras. No es una herramienta clínica ni diagnóstica.
 * Una coincidencia NO significa que exista riesgo: genera una alerta para que
 * el equipo autorizado revise el contexto completo.
 *
 * Antes de usarse con estudiantes reales debe ser revisada y validada por un
 * profesional con experiencia en salud mental adolescente.
 */

export type Categoria = {
  cat: number;
  prioridad: 1 | 2 | 3 | 4;
  nombre: string;
  terminos: string[];
};

export const CATEGORIAS: Categoria[] = [
  {
    cat: 6,
    prioridad: 4,
    nombre: "Desesperanza e ideación suicida",
    terminos: ["quiero morir", "no quiero vivir", "no quiero seguir viviendo", "matarme", "suicid", "quiero desaparecer", "mejor estar muerta", "mejor estar muerto", "no vale la pena vivir", "la vida no tiene sentido"],
  },
  {
    cat: 8,
    prioridad: 4,
    nombre: "Lucha contra la autolesión",
    terminos: ["quiero cortarme", "ganas de cortarme", "quiero hacerme daño", "hacerme dano", "no puedo parar", "tengo el impulso", "no puedo resistir"],
  },
  {
    cat: 1,
    prioridad: 3,
    nombre: "Abstención de autolesión",
    terminos: ["autolesion", "autolesión", "cortarme", "volver a cortarme", "recai", "recaí", "no puedo dejarlo"],
  },
  {
    cat: 7,
    prioridad: 3,
    nombre: "Ocultamiento de autolesiones",
    terminos: ["cicatrices", "esconder las heridas", "ocultar mis cortes", "que nadie vea", "cubrir mis brazos", "mangas largas"],
  },
  {
    cat: 3,
    prioridad: 2,
    nombre: "Autodesprecio explícito",
    terminos: ["me odio", "odio mi vida", "soy inutil", "soy inútil", "no valgo nada", "soy una carga", "no sirvo para nada", "me doy asco"],
  },
  {
    cat: 5,
    prioridad: 2,
    nombre: "Malestar psicológico",
    terminos: ["no puedo mas", "no puedo más", "estoy sufriendo", "deprimid", "ansiedad", "angustia", "estoy empeorando", "me siento muy mal"],
  },
  {
    cat: 9,
    prioridad: 2,
    nombre: "Llanto y malestar emocional intenso",
    terminos: ["no paro de llorar", "lloro todas las noches", "no puedo dormir", "me despierto llorando", "me siento vacia", "me siento vacío", "estoy destrozad"],
  },
  {
    cat: 2,
    prioridad: 1,
    nombre: "Búsqueda de apoyo",
    terminos: ["necesito ayuda", "necesito hablar", "no puedo sola", "no puedo solo", "ayudame", "ayúdame", "nadie me escucha", "no se con quien hablar"],
  },
  {
    cat: 10,
    prioridad: 1,
    nombre: "Problemas familiares y sociales",
    terminos: ["nadie me quiere", "estoy sola", "estoy solo", "no tengo amigos", "me excluyen", "problemas en casa", "mi familia no me entiende"],
  },
  {
    cat: 4,
    prioridad: 1,
    nombre: "Dificultad para expresar sentimientos",
    terminos: ["nadie me entiende", "no puedo explicar lo que siento", "no se como sentirme", "no puedo decirlo"],
  },
];

export type Coincidencia = { categoria: string; cat: number; prioridad: number; termino: string };

/** Devuelve la coincidencia de mayor prioridad, o null si no hay ninguna. */
export function analizar(texto: string): Coincidencia | null {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, ""); // quita tildes, deja la ñ

  let mejor: Coincidencia | null = null;

  for (const c of CATEGORIAS) {
    for (const term of c.terminos) {
      const norm = term
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u0302\u0304-\u036f]/g, "");
      if (t.includes(norm) && (!mejor || c.prioridad > mejor.prioridad)) {
        mejor = { categoria: c.nombre, cat: c.cat, prioridad: c.prioridad, termino: term };
      }
    }
  }
  return mejor;
}

/** A partir de esta prioridad se le muestra a la estudiante la pantalla de apoyo (M5). */
export const PRIORIDAD_APOYO = 3;
