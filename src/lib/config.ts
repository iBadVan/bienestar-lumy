/**
 * Todo el contenido que las investigadoras pueden cambiar sin tocar la lógica.
 * Un solo archivo para que no haya que buscar datos regados por el código.
 */

/** C5: el estudio dura 42 días; el uso de la app son 30 (días 8 al 37 del Anexo N°4). */
export const DIAS_TOTALES = 30;

/** L5: 10 puntos por día completado, 300 como máximo. */
export const PUNTOS_DIA = 10;

/**
 * Ya no hay clave comun: cada participante crea la suya al registrarse.
 * Se conserva la constante porque el panel la menciona al restablecer.
 */
export const CLAVE_INICIAL = "Lumy2026";

/**
 * Dos identificadores distintos:
 *
 *  - Codigo de acceso: LMY-K4T9P. Aleatorio, es el que se reparte en papel y
 *    con el que la participante entra. No se puede adivinar ni enumerar.
 *  - Codigo de estudio: LMY-0001 a LMY-0150. Correlativo, lo asigna el sistema
 *    al registrarse y es el que se usa en el analisis.
 */
export const FORMATO_CODIGO_ACCESO = /^LMY-[A-Z0-9]{5}$/;
export const TOTAL_PARTICIPANTES = 150;

export type Emocion = {
  id: string;
  nombre: string;
  face: string;
  bg: string;
  valencia: number;
  alerta: boolean;
};

/**
 * I1 + E1: las siete emociones iniciales mas ansiedad y estres, agregadas el
 * 28/09/2026 para que el registro diario mida lo mismo que el DASS-21.
 *
 * "alerta: true" significa que al elegirla aparece la pantalla de
 * acompanamiento de Lumy. Cambiar ese booleano es todo lo que hace falta
 * si se quiere ajustar cuales la disparan.
 */
export const EMOCIONES: Emocion[] = [
  { id: "alegria", nombre: "Alegr\u00eda", face: "\u{1F60A}", bg: "bg-emo-feliz", valencia: 5, alerta: false },
  { id: "sorpresa", nombre: "Sorpresa", face: "\u{1F62E}", bg: "bg-emo-tranquilo", valencia: 4, alerta: false },
  { id: "asco", nombre: "Asco", face: "\u{1F922}", bg: "bg-emo-neutral", valencia: 2.5, alerta: false },
  { id: "desprecio", nombre: "Desprecio", face: "\u{1F612}", bg: "bg-emo-neutral", valencia: 2.5, alerta: false },
  { id: "ansiedad", nombre: "Ansiedad", face: "\u{1F630}", bg: "bg-emo-ansioso", valencia: 2, alerta: true },
  { id: "estres", nombre: "Estr\u00e9s", face: "\u{1F62B}", bg: "bg-emo-estresado", valencia: 2, alerta: true },
  { id: "ira", nombre: "Ira", face: "\u{1F620}", bg: "bg-emo-estresado", valencia: 1.5, alerta: true },
  { id: "miedo", nombre: "Miedo", face: "\u{1F628}", bg: "bg-emo-triste", valencia: 1.5, alerta: true },
  { id: "tristeza", nombre: "Tristeza", face: "\u{1F622}", bg: "bg-emo-triste", valencia: 1.5, alerta: true },
];

/** L6: tabla de insignias tal como la definieron. */
export const INSIGNIAS = [
  { dia: 1, nombre: "Mi primer paso", ico: "🌱" },
  { dia: 7, nombre: "Exploradora", ico: "🧭" },
  { dia: 14, nombre: "En camino", ico: "🚶" },
  { dia: 21, nombre: "Constante", ico: "🔁" },
  { dia: 28, nombre: "Alcanzando el bienestar", ico: "🌤️" },
  { dia: 30, nombre: "Bienestar logrado", ico: "🏆" },
];

export type TipoModulo =
  | "registro"
  | "psicoeducacion"
  | "respiracion"
  | "manifestaciones"
  | "escritura"
  | "mindfulness"
  | "afirmaciones"
  | "cierre";

/** Ciclo de 7 actividades repetido 4 veces (días 1 a 28). */
export const CICLO: TipoModulo[] = [
  "registro",
  "psicoeducacion",
  "respiracion",
  "manifestaciones",
  "escritura",
  "mindfulness",
  "afirmaciones",
];

export const MODULOS: Record<TipoModulo, { nombre: string; ico: string; intro: string }> = {
  registro: {
    nombre: "Tu espacio de hoy",
    ico: "📓",
    intro: "Escribe lo que viviste hoy. Nadie de tu colegio lo va a leer.",
  },
  psicoeducacion: {
    nombre: "¿Qué es el estrés?",
    ico: "💡",
    intro: "Hoy vamos a entender qué es el estrés, qué tipos hay y cómo afecta tu salud.",
  },
  respiracion: {
    nombre: "Respira profundo",
    ico: "🌬️",
    intro: "Exploraremos cómo reacciona tu cuerpo y practicaremos una técnica guiada.",
  },
  manifestaciones: {
    nombre: "Cómo se manifiesta",
    ico: "🔍",
    intro: "Señales físicas, emocionales, cognitivas y conductuales del estrés.",
  },
  escritura: {
    nombre: "Escritura libre",
    ico: "✍️",
    intro: "Cuéntame algo que te haya generado malestar. No importa la ortografía.",
  },
  mindfulness: {
    nombre: "Atención plena",
    ico: "🍃",
    intro: "Respiración consciente, atención al cuerpo y observación de tus pensamientos.",
  },
  afirmaciones: {
    nombre: "Palabras para ti",
    ico: "✨",
    intro: "Léelas en voz alta, sin apuro.",
  },
  cierre: {
    nombre: "Tu experiencia",
    ico: "💬",
    intro: "Últimos días. Tus respuestas ayudan a mejorar la aplicación.",
  },
};

export type Pregunta = { q: string; o: string[]; c: number };

/** C2: cada cuestionario tiene 5 preguntas y cada una vale 4 puntos (20 en total). */
export const PUNTOS_POR_PREGUNTA = 4;

/**
 * K7 y C2: 5 preguntas por quiz, 4 puntos cada una, retroalimentación inmediata.
 * PENDIENTE: estas preguntas son de ejemplo. Las definitivas las entregan
 * las investigadoras y pasan por juicio de expertos.
 */
export const QUIZ: Partial<Record<TipoModulo, Pregunta[]>> = {
  psicoeducacion: [
    { q: "El estrés es...", o: ["Una respuesta del cuerpo ante algo que exige adaptarse", "Una enfermedad mental", "Algo que solo les pasa a los adultos"], c: 0 },
    { q: "El estrés en pequeñas dosis puede...", o: ["Ser siempre dañino", "Ayudarte a reaccionar y concentrarte", "No tener ningún efecto"], c: 1 },
    { q: "El estrés que se mantiene mucho tiempo se llama", o: ["Estrés agudo", "Estrés crónico", "Estrés social"], c: 1 },
    { q: "¿Cuál puede ser una fuente de estrés escolar?", o: ["Un examen importante", "Dormir bien", "Escuchar música"], c: 0 },
    { q: "Sentir estrés antes de una exposición significa que", o: ["Algo está mal contigo", "Es una reacción normal del cuerpo", "Debes dejar de estudiar"], c: 1 },
  ],
  manifestaciones: [
    { q: "Dolor de cabeza y tensión en el cuello son señales", o: ["Físicas", "Cognitivas", "Conductuales"], c: 0 },
    { q: "Costarte concentrarte o quedarte en blanco es una señal", o: ["Física", "Cognitiva", "Emocional"], c: 1 },
    { q: "Estar irritable o llorar con facilidad es una señal", o: ["Conductual", "Emocional", "Física"], c: 1 },
    { q: "Dejar de salir con tus amigos por el malestar es una señal", o: ["Conductual", "Cognitiva", "Física"], c: 0 },
    { q: "Reconocer tus señales de estrés sirve para", o: ["Preocuparte más", "Actuar a tiempo", "Ignorarlas mejor"], c: 1 },
  ],
};

export const AFIRMACIONES = [
  "Lo que siento hoy no define quién soy.",
  "Puedo pedir ayuda sin que eso me haga débil.",
  "Estoy aprendiendo, y aprender toma tiempo.",
  "Mi manera de sentir tiene sentido.",
  "Hoy hice algo por mí, y eso cuenta.",
];

/** J6: las diez preguntas de cierre, textuales. */
export const PREGUNTAS_CIERRE = [
  "¿Qué actividad de la aplicación te gustó más y por qué?",
  "¿Qué actividad te resultó más útil?",
  "¿Hubo alguna actividad que te haya resultado difícil? ¿Cuál?",
  "¿La aplicación fue fácil de entender y navegar?",
  "¿Las actividades y contenidos te parecieron interesantes y adecuados para tu edad?",
  "¿La aplicación te ayudó a conocer mejor tus emociones?",
  "¿Qué cambiarías o mejorarías de la aplicación?",
  "¿Recomendarías utilizar esta aplicación a otros adolescentes? ¿Por qué?",
  "Si pudieras agregar algo nuevo a la aplicación, ¿qué sería?",
  "¿Quieres compartir algún comentario adicional sobre tu experiencia?",
];

/** Mensajes de Lumy según la emoción registrada (I6). */
export const MENSAJES_LUMY: Record<string, string> = {
  ansiedad:
    "Noto que hoy la cabeza no te da tregua. No tienes que resolverlo todo ahora mismo. Respiremos un momento juntas.",
  estres:
    "Parece que hoy fue mucho. Estar cansada de sostener tanto no es debilidad. Paremos un ratito.",
  ira: "Veo que hoy hay algo que te molesta mucho. Enojarse no está mal, es una señal. ¿Le damos un poco de aire antes de seguir?",
  miedo: "Veo que hoy podrías necesitar una pausa. Recuerda que no tienes que ser fuerte todo el tiempo. ¿Qué tal si respiramos juntas?",
  tristeza: "Gracias por contármelo. La tristeza también merece espacio. Quédate aquí un momento conmigo.",
};

/** Expresion del avatar en la pantalla de acompanamiento, segun la emocion. */
export const EXPRESION_APOYO: Record<string, "preocupada" | "apenada" | "triste" | "cansada" | "confundida"> = {
  ansiedad: "confundida",
  estres: "cansada",
  ira: "preocupada",
  miedo: "preocupada",
  tristeza: "apenada",
};

/**
 * Plazo de respuesta comprometido para cada nivel de prioridad, en horas.
 * Prioridad 4: el mismo dia. Prioridad 3: dentro de 24 horas.
 * El panel marca en rojo las alertas que ya pasaron su plazo.
 */
export const PLAZO_ALERTA_HORAS: Record<number, number> = { 4: 12, 3: 24 };

export function alertaVencida(prioridad: number, recibidoEn: string): boolean {
  const horas = PLAZO_ALERTA_HORAS[prioridad];
  if (!horas) return false;
  return Date.now() - new Date(recibidoEn).getTime() > horas * 3600 * 1000;
}

/**
 * Afiches entregados por las investigadoras el 28/09/2026.
 * Dos por semana, de modo que el contenido cambie en cada ciclo en vez de
 * repetirse. PENDIENTE de que ellas confirmen este orden.
 */
export type Afiche = { archivo: string; titulo: string };

export const AFICHES: Record<number, { psicoeducacion: Afiche; manifestaciones: Afiche }> = {
  1: {
    psicoeducacion: { archivo: "semana1-psicoeducacion", titulo: "El estrés, ¿aliado o enemigo?" },
    manifestaciones: { archivo: "semana1-manifestaciones", titulo: "El estrés, ¿cómo te avisa?" },
  },
  2: {
    psicoeducacion: { archivo: "semana2-psicoeducacion", titulo: "Ansiedad, ¿por qué me preocupo tanto?" },
    manifestaciones: { archivo: "semana2-manifestaciones", titulo: "Manifestaciones de la ansiedad" },
  },
  3: {
    psicoeducacion: { archivo: "semana3-psicoeducacion", titulo: "Depresión, ¿es tristeza o hay algo más?" },
    manifestaciones: { archivo: "semana3-manifestaciones", titulo: "Manifestaciones de la depresión" },
  },
  4: {
    psicoeducacion: { archivo: "semana4-psicoeducacion", titulo: "Afrontamiento, ¿qué hago con lo que siento?" },
    manifestaciones: { archivo: "semana4-manifestaciones", titulo: "Recomendaciones, ¿qué puedo hacer por mí?" },
  },
};

export function aficheDe(semana: number, tipo: "psicoeducacion" | "manifestaciones") {
  return AFICHES[Math.min(4, Math.max(1, semana))][tipo];
}
