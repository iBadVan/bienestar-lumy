# Puesta en marcha con Supabase

Pasos en orden. Cada uno depende del anterior.

## 1. Esquema

SQL Editor, pegar `supabase/schema.sql` completo, Run.
Debe aparecer "Success. No rows returned" y nueve tablas en el Table Editor.

## 2. Credenciales en local

Copiar `.env.local.ejemplo` como `.env.local` y completar la URL del proyecto.
Luego reiniciar el servidor:

```
npm run dev
```

Si la app sigue funcionando igual que antes, las credenciales no se estan
leyendo: revisar que el archivo se llame exactamente `.env.local` y este en la
raiz, junto al `package.json`.

## 3. Los 150 codigos

Necesita la clave secreta, que NO se sube a GitHub ni se comparte.

```
set SUPABASE_URL=https://TU-REFERENCIA.supabase.co
set SUPABASE_SERVICE_KEY=sb_secret_...
node scripts/crear-participantes.mjs
```

Tarda unos dos minutos. Al final imprime cuantas cuentas creo.
Correrlo dos veces no rompe nada: las que ya existen las reporta como
existentes y sigue.

Comprobacion: Authentication, Users debe mostrar 150 usuarios, y la tabla
`participantes` 150 filas.

## 4. Las investigadoras

Authentication, Users, Add user, una por cada una, con "Auto Confirm User"
marcado. Copiar los UUID y correr `supabase/investigadoras.sql` con esos
valores reemplazados.

Sin este paso el panel no muestra datos: las policies solo dejan ver todo a
quien figure en la tabla `investigadoras`.

## 5. Vercel

Project Settings, Environment Variables. Agregar las dos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Marcar los tres entornos (Production, Preview, Development) y volver a
desplegar, porque las variables no se aplican al despliegue que ya existe.

## 6. Prueba de punta a punta

1. Entrar con LMY-0001 y la clave inicial.
2. Cambiar la contrasena.
3. Registrar una emocion y escribir en el diario.
4. En Supabase, Table Editor, `registros_emocion` y `entradas_diario` deben
   tener las filas nuevas.
5. Escribir en el diario algo que dispare una alerta y comprobar que aparece
   en la tabla `alertas` con su `prioridad_auto`.

## Prueba del funcionamiento sin conexion

1. Con la sesion ya iniciada, activar el modo avion.
2. Registrar emocion y diario. La app debe seguir funcionando.
3. En la pantalla principal debe aparecer el aviso de registros guardados.
4. Desactivar el modo avion. El aviso desaparece y las filas llegan a Supabase.
5. En la vista `alertas_con_retraso` se puede ver cuanto tardo en llegar cada
   alerta. Ese es el dato que el protocolo necesita poder auditar.
