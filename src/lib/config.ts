/**
 * Todo el contenido que las investigadoras pueden cambiar sin tocar la lógica.
 * Un solo archivo para que no haya que buscar datos regados por el código.
 */

/** C5: el estudio dura 42 días; el uso de la app son 30 (días 8 al 37 del Anexo N°4). */
export const DIAS_TOTALES = 30;

/** L5: 10 puntos por día completado, 300 como máximo. */
export const PUNTOS_DIA = 10;

/** F4: clave inicial común, con cambio obligatorio en el primer ingreso (F5). */
export const CLAVE_INICIAL = "Lumy2026";

/** F3: rango de códigos asignados al estudio. */
export const CODIGO_MIN = 1;
export const CODIGO_MAX = 150;

export type Emocion = {
  id: string;
  nombre: string;
  face: string;
  bg: string;
  valencia: number;
  alerta: boolean;
};

/** I1: las siete emociones que pidieron las investigadoras. */
export const EMOCIONES: Emocion[] = [
  { id: "alegria", nombre: "Alegría", face: "😊", bg: "bg-emo-feliz", valencia: 5, alerta: false },
  { id: "sorpresa", nombre: "Sorpresa", face: "😮", bg: "bg-emo-tranquilo", valencia: 4, alerta: false },
  { id: "asco", nombre: "Asco", face: "🤢", bg: "bg-emo-neutral", valencia: 2.5, alerta: false },
  { id: "desprecio", nombre: "Desprecio", face: "😒", bg: "bg-emo-ansioso", valencia: 2.5, alerta: false },
  { id: "ira", nombre: "Ira", face: "😠", bg: "bg-emo-estresado", valencia: 1.5, alerta: true },
  { id: "miedo", nombre: "Miedo", face: "😨", bg: "bg-emo-triste", valencia: 1.5, alerta: true },
  { id: "tristeza", nombre: "Tristeza", face: "😢", bg: "bg-emo-triste", valencia: 1.5, alerta: true },
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

/**
 * K7: 5 preguntas por quiz, puntaje de 0 a 5, retroalimentación inmediata.
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
  ira: "Veo que hoy hay algo que te molesta mucho. Enojarse no está mal, es una señal. ¿Le damos un poco de aire antes de seguir?",
  miedo: "Veo que hoy podrías necesitar una pausa. Recuerda que no tienes que ser fuerte todo el tiempo. ¿Qué tal si respiramos juntas?",
  tristeza: "Gracias por contármelo. La tristeza también merece espacio. Quédate aquí un momento conmigo.",
};
