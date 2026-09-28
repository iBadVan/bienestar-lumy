-- =============================================================================
-- Reparacion: permisos que faltaban y carga de participantes
--
-- Correr en el SQL Editor. Es seguro ejecutarlo varias veces.
-- =============================================================================

-- ------------------------------------------------- 1. permisos del Data API

grant usage on schema public to anon, authenticated;

grant select, insert on
  registros_emocion, actividades_completadas, entradas_diario,
  resultados_quiz, insignias_obtenidas, respuestas_cierre, alertas
  to authenticated;

grant select, update on participantes to authenticated;
grant select on investigadoras to authenticated;
grant update on alertas to authenticated;
grant select on alertas_con_retraso, participantes_inactivas to authenticated;

-- --------------------------------- 2. crear las filas que el script no creo
--
-- Las cuentas ya existen en auth.users con su codigo guardado en los metadatos.
-- Esto toma esas cuentas y arma la fila correspondiente en participantes.

insert into participantes (id, codigo, grupo, clave_cambiada, estado, dia_actual)
select
  u.id,
  upper(u.raw_user_meta_data ->> 'codigo'),
  'experimental'::grupo_estudio,
  false,
  'activa'::estado_participante,
  1
from auth.users u
where u.raw_user_meta_data ->> 'codigo' ~ '^LMY-[0-9]{4}$'
on conflict (id) do nothing;

-- ------------------------------------------------------ 3. comprobaciones

select count(*) as cuentas_de_acceso
  from auth.users
 where raw_user_meta_data ->> 'codigo' is not null;

select count(*) as participantes_registradas from participantes;

select codigo, clave_cambiada, estado
  from participantes
 order by codigo
 limit 5;
