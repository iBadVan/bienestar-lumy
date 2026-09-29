-- =============================================================================
-- La columna codigo seguia exigiendo el formato viejo (LMY-0001)
--
-- Ahora guarda el codigo de acceso aleatorio (LMY-Q4KDC), asi que la regla
-- anterior rechazaba cada registro. El correlativo del estudio vive aparte,
-- en codigo_estudio, y ese si conserva su formato.
-- =============================================================================

alter table participantes drop constraint if exists participantes_codigo_check;

alter table participantes
  add constraint participantes_codigo_check
  check (codigo ~ '^LMY-[A-Z0-9]{4,5}$');

alter table participantes
  add constraint participantes_codigo_estudio_check
  check (codigo_estudio is null or codigo_estudio ~ '^LMY-[0-9]{4}$');

-- Limpia cuentas que quedaron sin ficha por este error
delete from auth.users u
 where u.raw_user_meta_data ->> 'codigo_acceso' is not null
   and not exists (select 1 from participantes p where p.id = u.id);

-- Libera los codigos que se marcaron como usados sin haberse completado
update codigos_acceso
   set usado = false, usado_por = null, usado_en = null
 where usado = true
   and usado_por is not null
   and not exists (select 1 from participantes p where p.id = usado_por);

select
  (select count(*) from codigos_acceso where not usado) as codigos_libres,
  (select count(*) from participantes)                  as participantes;
