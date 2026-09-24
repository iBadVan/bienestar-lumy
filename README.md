# Bienestar con Lumy

Aplicación de acompañamiento emocional para la tesis *Efectividad de una aplicación móvil en el
nivel de bienestar emocional en adolescentes de un colegio público de Arequipa, 2027*
(Emely Calloapaza Cabana y Marcela Mamani Chocano, Enfermería UCSM).

Esta es la **demo web**. Sirve para que las investigadoras validen flujos y pantallas antes de
construir el APK Android definitivo.

## Estado

| Pieza | Estado |
|---|---|
| Flujo completo del estudiante (30 días) | Funcionando |
| Registro emocional, diario, quizzes, respiración | Funcionando |
| Gamificación: puntos, racha, insignias | Funcionando |
| Detección preventiva de riesgo en el diario | Funcionando, lista reducida |
| Panel administrativo con alertas y exportación CSV | Funcionando |
| Persistencia | localStorage del navegador |
| Base de datos real, sincronización y multiusuario | Pendiente, fase 2 |
| Funcionamiento sin conexión | Pendiente, llega con el APK |
| Notificaciones 7 p.m. y 9 p.m. | Pendiente, llega con el APK |

**Esta demo no sirve para recoger datos reales de estudiantes.** Los datos viven sin cifrar en el
navegador y no hay autenticación real.

## Subirlo a GitHub

```bash
cd bienestar-lumy
git init
git add .
git commit -m "Demo web de Bienestar con Lumy"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bienestar-lumy.git
git push -u origin main
```

## Desplegar en Vercel

1. Entrar a vercel.com e importar el repositorio.
2. Vercel detecta Next.js solo. No hay que configurar nada ni definir variables de entorno todavía.
3. El despliegue toma alrededor de un minuto y devuelve una URL pública.

Para correrlo en local:

```bash
npm install
npm run dev
```

## Cómo está organizado

```
src/
  app/
    page.tsx              pantalla de inicio
    consentimiento/       "Tu espacio seguro"
    ingreso/              elección de perfil
    registro/             creación de cuenta
    login/                ingreso con código
    clave/                cambio obligatorio de contraseña
    app/                  zona de la estudiante
      page.tsx            inicio con progreso y "Tu camino"
      emocion/            registro emocional diario
      apoyo/              pantalla de Lumy ante emoción de malestar
      respirar/           respiración guiada con temporizador
      actividad/          actividad del día según el guion
    panel/                panel administrativo
  components/ui.tsx       botones, tarjetas, campos, avatar de Lumy
  lib/
    config.ts             CONTENIDO EDITABLE: días, emociones, insignias, quizzes, textos
    riesgo.ts             categorías y términos de detección preventiva
    store.tsx             estado, persistencia y reglas de progresión
tailwind.config.ts        paleta tomada del prototipo en Figma
```

Para cambiar contenidos, textos, puntajes o insignias basta con editar `src/lib/config.ts`.
No hace falta tocar ningún componente.

## Decisiones ya tomadas

- **Duración:** 30 días de uso de la app, dentro de los 42 del estudio. Días 1 a 28 son cuatro
  ciclos de las siete actividades del Anexo N°4; días 29 y 30 son la encuesta de experiencia.
- **Progresión:** se habilita el día actual y los días anteriores pendientes, nunca uno futuro.
  Así se cumplen a la vez L2 (no adelantarse) y L3 (recuperar días perdidos).
- **Contraseña:** clave inicial común con cambio obligatorio en el primer ingreso.
- **Puntaje:** 10 puntos por día, 300 máximo. El puntaje de los quizzes se guarda aparte.
- **Privacidad:** el panel muestra el código de participante, nunca el nombre.

## Pendientes que bloquean el piloto

1. **Dictamen del comité de ética.** Sigue sin definirse. Sin él no se puede aplicar nada a menores.
2. **Contenidos.** Faltan el video de respiración, el audio de mindfulness, las dos infografías y
   las preguntas reales de los quizzes. Las que están en el código son de ejemplo.
3. **Lista de palabras de riesgo.** Implementada de forma reducida. Debe ser revisada y validada
   por un profesional de salud mental antes de usarse con estudiantes, tal como quedó acordado.
4. **Protocolo de alertas.** Con funcionamiento sin conexión una alerta crítica puede llegar días
   después. El protocolo dice "revisión inmediata". Hay que elegir una de las dos cosas.
5. **Emociones.** Las siete registradas no incluyen ansiedad ni estrés, que son dos de las tres
   subescalas del DASS-21. Conviene revisarlo con la asesora.

## Avatar de Lumy

El avatar actual es un SVG provisional en `src/components/ui.tsx`. Cuando entreguen la imagen
definitiva, colocarla en `public/lumy.png` y reemplazar ese componente por un `<Image>` de Next.
