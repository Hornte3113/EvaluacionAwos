-- migrate.sql: Orquesta la ejecución de todos los scripts en orden correcto
-- 1. Crear tablas
\i /sql/schema.sql
-- 2. Insertar datos de prueba
\i /sql/seed.sql
-- 3. Crear VIEWS de reportes
\i /sql/reports_vw.sql
-- 4. Crear índices para optimización
\i /sql/indexes.sql
-- 5. Crear rol de seguridad con permisos mínimos
\i /sql/roles.sql
