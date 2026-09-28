-- =============================================================================
-- Bienestar. Esquema de base de datos (Supabase / PostgreSQL)
--
-- Decisiones que este esquema refleja:
--  - Alternativa 1 confirmada: la app funciona sin conexion y sincroniza despues.
--    Por eso cada registro guarda DOS momentos: cuando ocurrio en el celular
--    (ocurrido_en) y cuando llego al servidor (recibido_en). La diferencia entre
--    ambos es la evidencia del retraso, necesaria para el protocolo de alertas
--    y util para el analisis de adherencia.
--  - Cada participante solo puede leer y escribir lo suyo (A7: celular prestado).
--  - Las investigadoras leen todo; nadie mas.
--  - La app no calcula indicadores (D2): solo guarda y exporta.
--
-- Orden de ejecucion: correr este archivo completo en el editor SQL de Supabase.
-- =============================================================================

-- ------------------------------------------------------------------ tipos ---

create type grupo_estudio as enum ('experimental', 'control');
create type estado_participante as enum ('activa', 'inactiva', 'retirada', 'finalizada');
create type estado_alerta as enum ('pendiente', 'en seguimiento', 'cerrada');

-- ----------------------------------------------------------- participantes --

create table participantes (
  id              uuid primary key references auth.users(id) on delete cascade,
  codigo          text unique not null check (codigo ~ '^LMY-\d{4}$'),
  inicial         text,
  apellidos       text,
  edad            smallint check (edad between 12 and 17),
  sexo            char(1) check (sexo in ('F', 'M')),
  grado           text,
  vive_ambos_padres boolean,
  grupo           grupo_estudio not null default 'experimental',
  clave_cambiada  boolean not null default false,
  estado          estado_participante not null default 'activa',
  dia_actual      smallint not null default 1 check (dia_actual between 1 and 30),
  creado_en       timestamptz not null default now(),
  ultimo_ingreso  timestamptz
);

comment on column participantes.apellidos is
  'Se almacena por pedido del equipo de investigacion, pero no se muestra en el panel ni se incluye en las exportaciones.';

-- --------------------------------------------------------- investigadoras --

create table investigadoras (
  id        uuid primary key references auth.users(id) on delete cascade,
  nombre    text not null,
  correo    text not null,
  creado_en timestamptz not null default now()
);

create or replace function es_investigadora()
returns boolean language sql stable security definer as $$
  select exists (select 1 from investigadoras where id = auth.uid());
$$;

-- ------------------------------------------------------ registro emocional --

create table registros_emocion (
  id           uuid primary key default gen_random_uuid(),
  participante uuid not null references participantes(id) on delete cascade,
  dia          smallint not null check (dia between 1 and 30),
  emocion      text not null,
  ocurrido_en  timestamptz not null,
  recibido_en  timestamptz not null default now()
);

-- I2: hasta dos registros por dia
create index on registros_emocion (participante, dia);

-- ------------------------------------------------------------- actividades --

create table actividades_completadas (
  participante uuid not null references participantes(id) on delete cascade,
  dia          smallint not null check (dia between 1 and 30),
  modulo       text not null,
  puntos       smallint not null default 10,
  ocurrido_en  timestamptz not null,
  recibido_en  timestamptz not null default now(),
  primary key (participante, dia)
);

-- ------------------------------------------------------------------ diario --

create table entradas_diario (
  id           uuid primary key default gen_random_uuid(),
  participante uuid not null references participantes(id) on delete cascade,
  dia          smallint not null check (dia between 1 and 30),
  modulo       text not null,
  texto        text not null,
  ocurrido_en  timestamptz not null,
  recibido_en  timestamptz not null default now()
);

comment on table entradas_diario is
  'J1: las entradas no se editan ni se borran. No existe policy de update ni de delete.';

create index on entradas_diario (participante, dia);

-- ------------------------------------------------------------- cuestionarios

create table resultados_quiz (
  id           uuid primary key default gen_random_uuid(),
  participante uuid not null references participantes(id) on delete cascade,
  dia          smallint not null check (dia between 1 and 30),
  modulo       text not null,
  puntaje      smallint not null,
  total        smallint not null,
  ocurrido_en  timestamptz not null,
  recibido_en  timestamptz not null default now()
);

-- --------------------------------------------------------------- insignias --

create table insignias_obtenidas (
  participante uuid not null references participantes(id) on delete cascade,
  insignia     text not null,
  obtenida_en  timestamptz not null,
  primary key (participante, insignia)
);

-- ------------------------------------------------------- cierre del estudio --

create table respuestas_cierre (
  participante uuid not null references participantes(id) on delete cascade,
  pregunta     smallint not null,
  texto        text,
  ocurrido_en  timestamptz not null,
  recibido_en  timestamptz not null default now(),
  primary key (participante, pregunta)
);

-- ----------------------------------------------------------------- alertas --

create table alertas (
  id               uuid primary key default gen_random_uuid(),
  participante     uuid not null references participantes(id) on delete cascade,
  entrada          uuid references entradas_diario(id) on delete set null,
  dia              smallint not null,
  categoria        text not null,
  categoria_num    smallint not null,
  prioridad_auto   smallint not null check (prioridad_auto between 1 and 4),
  prioridad_final  smallint check (prioridad_final between 0 and 4),
  estado           estado_alerta not null default 'pendiente',
  observacion      text,
  extracto         text not null,
  ocurrido_en      timestamptz not null,
  recibido_en      timestamptz not null default now(),
  revisada_en      timestamptz,
  revisada_por     uuid references investigadoras(id)
);

-- Retraso entre lo que escribio la participante y lo que vieron las
-- investigadoras. Es el dato que el protocolo necesita poder auditar.
create view alertas_con_retraso as
  select a.*,
         (a.recibido_en - a.ocurrido_en) as retraso_sincronizacion,
         (a.revisada_en - a.recibido_en) as tiempo_de_respuesta
    from alertas a;

create index on alertas (estado, prioridad_auto);

-- ---------------------------------------------------- alertas de inactividad

-- M7: tres dias consecutivos sin registrar ningun ingreso.
create view participantes_inactivas as
  select p.id, p.codigo, p.ultimo_ingreso,
         (now() - p.ultimo_ingreso) as tiempo_sin_ingresar
    from participantes p
   where p.estado = 'activa'
     and (p.ultimo_ingreso is null or p.ultimo_ingreso < now() - interval '3 days');

-- =============================================================================
-- Seguridad a nivel de fila
-- =============================================================================

alter table participantes            enable row level security;
alter table investigadoras           enable row level security;
alter table registros_emocion        enable row level security;
alter table actividades_completadas  enable row level security;
alter table entradas_diario          enable row level security;
alter table resultados_quiz          enable row level security;
alter table insignias_obtenidas      enable row level security;
alter table respuestas_cierre        enable row level security;
alter table alertas                  enable row level security;

-- Participantes: cada una ve y edita solo su propia ficha.
create policy p_self_select on participantes
  for select using (id = auth.uid() or es_investigadora());
create policy p_self_update on participantes
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy p_admin_all on participantes
  for all using (es_investigadora()) with check (es_investigadora());

create policy i_self on investigadoras
  for select using (id = auth.uid());

-- Tablas de datos: insertar lo propio, leer lo propio, y lectura total para
-- las investigadoras. No se define update ni delete: los registros del estudio
-- no se modifican una vez enviados.
do $$
declare t text;
begin
  foreach t in array array[
    'registros_emocion', 'actividades_completadas', 'entradas_diario',
    'resultados_quiz', 'insignias_obtenidas', 'respuestas_cierre'
  ] loop
    execute format(
      'create policy %I on %I for insert with check (participante = auth.uid())',
      t || '_insert_propio', t);
    execute format(
      'create policy %I on %I for select using (participante = auth.uid() or es_investigadora())',
      t || '_select_propio', t);
  end loop;
end $$;

-- Alertas: la app las inserta, solo las investigadoras las leen y las revisan.
create policy a_insert on alertas
  for insert with check (participante = auth.uid());
create policy a_select_admin on alertas
  for select using (es_investigadora());
create policy a_update_admin on alertas
  for update using (es_investigadora()) with check (es_investigadora());

-- =============================================================================
-- Permisos de acceso al Data API
--
-- El proyecto se creo con "Automatically expose new tables" desactivado, que es
-- lo que recomienda Supabase. Por eso hay que conceder los permisos a mano.
-- Quien protege de verdad son las policies de arriba: estos GRANT solo permiten
-- que la peticion llegue, y RLS decide despues que filas puede tocar cada quien.
-- =============================================================================

grant usage on schema public to anon, authenticated;

-- Las participantes leen y escriben sus propios registros.
grant select, insert on
  registros_emocion, actividades_completadas, entradas_diario,
  resultados_quiz, insignias_obtenidas, respuestas_cierre, alertas
  to authenticated;

grant select, update on participantes to authenticated;
grant select on investigadoras to authenticated;

-- Las investigadoras revisan y cierran alertas.
grant update on alertas to authenticated;

-- Vistas de apoyo para el panel.
grant select on alertas_con_retraso, participantes_inactivas to authenticated;

-- El rol del servidor. Se usa en el script de carga inicial y en el
-- restablecimiento de contrasenas, que corren fuera del navegador.
-- Sin estos permisos ambas cosas fallan con un "no autorizado" enganoso,
-- porque el rol existe pero no alcanza las tablas.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- =============================================================================
-- Notas de implementacion
--
-- 1. Autenticacion de participantes.
--    Supabase Auth exige un correo. Las participantes no lo tienen, asi que
--    cada codigo se convierte en un correo interno: LMY-0001 pasa a ser
--    lmy0001@bienestar.interno. Nunca se muestra ni se envia nada a esa
--    direccion; existe solo para que funcionen los tokens y estas policies.
--    La carga inicial de los 150 codigos se hace una sola vez con un script
--    administrativo, no desde la app.
--
-- 2. Cambio de contrasena obligatorio (F5).
--    Las 150 cuentas se crean con la clave inicial comun. El campo
--    clave_cambiada arranca en false y la app no deja avanzar hasta que la
--    participante fije la suya.
--
-- 3. Aviso por correo ante alerta critica (B6).
--    Se resuelve con un trigger que llama a una funcion de borde cuando entra
--    una alerta con prioridad_auto >= 3. Queda fuera de este archivo porque
--    necesita la clave del servicio de correo.
--
-- 4. Retencion de datos (D3).
--    Sigue sin definirse. Cuando el equipo de investigacion lo decida, se
--    agrega aqui la rutina de anonimizacion o borrado correspondiente.
-- =============================================================================
