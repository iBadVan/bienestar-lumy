-- =============================================================================
-- Alta de las investigadoras
--
-- Correr DESPUES de schema.sql y despues de haber creado los usuarios.
--
-- Paso 1. En el panel de Supabase, Authentication, Users, Add user.
--         Crear un usuario por cada investigadora con su correo real y una
--         contrasena que ellas definan. Marcar "Auto Confirm User".
--
-- Paso 2. Copiar el UUID de cada usuario creado y reemplazarlo abajo.
-- =============================================================================

insert into investigadoras (id, nombre, correo) values
  ('UUID-DE-EMELY',   'Emely Rocio Calloapaza Cabana',          'correo-de-emely'),
  ('UUID-DE-MARCELA', 'Marcela Luana Yoryets Mamani Chocano',   'correo-de-marcela');

-- Verificacion: debe devolver las dos filas.
select i.nombre, i.correo, u.email
  from investigadoras i
  join auth.users u on u.id = i.id;
