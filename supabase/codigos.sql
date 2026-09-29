-- =============================================================================
-- Dos identificadores en vez de uno
--
-- codigo_acceso   Lo que recibe la participante en papel. Aleatorio, no se
--                 puede adivinar ni enumerar. Es con lo que entra a la app.
--
-- codigo_estudio  El correlativo LMY-0001 a LMY-0150 que el estudio necesita.
--                 Lo asigna el sistema en el momento del registro, por orden
--                 de llegada. Nadie sabe de antemano quien sera cual, lo que
--                 refuerza el anonimato del analisis.
--
-- Antes habia un solo codigo, consecutivo y con clave comun para todas: quien
-- supiera un numero podia entrar a la cuenta de otra y leerle el diario.
--
-- Correr en el SQL Editor despues de schema.sql.
-- =============================================================================

-- ------------------------------------------------------- codigos repartidos

create table if not exists codigos_acceso (
  codigo      text primary key check (codigo ~ '^LMY-[A-Z0-9]{5}$'),
  usado       boolean not null default false,
  usado_por   uuid references participantes(id) on delete set null,
  usado_en    timestamptz,
  creado_en   timestamptz not null default now()
);

alter table codigos_acceso enable row level security;
-- Nadie los consulta desde el navegador. Solo el servidor, al registrar.
grant select, insert, update on codigos_acceso to service_role;

-- ------------------------------------------- nuevas columnas de participante

alter table participantes
  add column if not exists codigo_acceso  text unique,
  add column if not exists codigo_estudio text unique,
  add column if not exists registrado_en  timestamptz;

-- El correlativo se entrega en orden de registro.
create sequence if not exists correlativo_estudio start 1;

create or replace function siguiente_codigo_estudio()
returns text language sql volatile as $$
  select 'LMY-' || lpad(nextval('correlativo_estudio')::text, 4, '0');
$$;

grant execute on function siguiente_codigo_estudio() to service_role;

-- ------------------------------------------------------------ comprobacion

select
  (select count(*) from codigos_acceso)                      as codigos_generados,
  (select count(*) from codigos_acceso where usado)          as codigos_usados,
  (select count(*) from participantes where codigo_estudio is not null) as registradas;
