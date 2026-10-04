-- =============================================================================
-- Cuanto vio del video cada participante
--
-- No se la obliga a verlo entero: una chica con un celular lento se frustraria
-- y abandonaria. En vez de forzarla, se registra hasta donde llego, que para
-- el analisis de adherencia es un dato mas util que un si o un no.
-- =============================================================================

alter table actividades_completadas
  add column if not exists segundos_vistos  integer,
  add column if not exists porcentaje_visto smallint;

-- Resumen por modulo, para el analisis
create or replace view visionado_por_modulo as
  select modulo,
         count(*)                                   as veces,
         round(avg(porcentaje_visto))               as porcentaje_promedio,
         count(*) filter (where porcentaje_visto >= 90) as vistas_completas
    from actividades_completadas
   where porcentaje_visto is not null
   group by modulo;

grant select on visionado_por_modulo to authenticated;

select 'listo' as estado;
