-- =============================================================================
-- Borra las 150 cuentas creadas con el esquema anterior
--
-- Aquellas usaban codigos consecutivos (LMY-0001 a LMY-0150) con la misma
-- contrasena para todas. Ya no sirven: ahora el codigo se reparte al azar y
-- cada participante crea su propia clave.
--
-- CORRER SOLO ANTES DEL ESTUDIO REAL. Si ya hay datos de participantes, esto
-- los elimina junto con las cuentas.
-- =============================================================================

-- Antes de borrar, comprobar que no haya nada valioso:
select
  (select count(*) from participantes)      as participantes,
  (select count(*) from registros_emocion)  as emociones,
  (select count(*) from entradas_diario)    as entradas_diario;

-- Si los tres salen en cero, o son solo pruebas, continuar:

delete from auth.users
 where raw_user_meta_data ->> 'codigo' ~ '^LMY-[0-9]{4}$';

-- Las fichas se borran solas por la relacion en cascada.
-- El correlativo vuelve a empezar en 1.
alter sequence correlativo_estudio restart with 1;

select count(*) as participantes_restantes from participantes;
