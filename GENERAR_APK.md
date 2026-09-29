# Generar el APK

## Una sola vez: Android Studio

Descargar de developer.android.com/studio e instalar aceptando lo que viene
por defecto. Al abrirlo la primera vez descarga el SDK; dejarlo terminar.
No hace falta crear ningun proyecto.

## Cada vez que quieras un APK nuevo

Desde la carpeta del proyecto:

```
npm install
npm run apk
```

Ese comando construye la version de la app, aparta el panel (que necesita
servidor y no puede ir dentro del APK) y copia todo al proyecto de Android.

Despues:

```
npm run apk:abrir
```

Se abre Android Studio. La primera vez tarda varios minutos indexando; es
normal. Cuando termine, en el menu de arriba:

**Build**, **Build Bundle(s) / APK(s)**, **Build APK(s)**

Al terminar aparece un aviso abajo a la derecha con un enlace "locate".
El archivo queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Ese es el archivo que se le pasa a las participantes.

## Instalarlo en un celular

Pasar el APK por WhatsApp, Drive o cable. Al abrirlo, Android va a advertir
que viene de un origen desconocido: hay que permitir la instalacion desde esa
aplicacion. Es lo esperado cuando no se publica en la tienda.

## Que hace distinto al APK respecto de la web

- Recordatorios a las 7:00 p. m. y 9:00 p. m., que una pagina web no puede dar
  de forma confiable. Si ya completo la actividad, el de las 9 no llega.
- Los contenidos viajan dentro del archivo, sin gastar datos.
- No incluye el panel ni el acceso de administradora: eso queda en la web,
  que es donde las investigadoras lo van a usar.

## Antes de entregarlo a las participantes

1. Instalarlo en al menos dos celulares distintos.
2. Entrar, cambiar contrasena, registrar emocion y escribir en el diario.
3. Activar modo avion, registrar algo mas, comprobar el aviso de pendientes.
4. Quitar el modo avion y verificar en Supabase que todo llego.
5. Dejar el celular hasta las 7:00 p. m. para comprobar que llega el aviso.

## Version para publicar

El APK de arriba es de depuracion. Sirve perfectamente para el estudio porque
se instala a mano, pero caduca y no esta optimizado. Si mas adelante quieren
una version firmada, en Android Studio: Build, Generate Signed Bundle / APK.
Hay que guardar el archivo de firma, porque sin el no se pueden publicar
actualizaciones.
