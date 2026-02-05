DROP ROLE IF EXISTS app_client;

-- Crear rol con permisos mínimos
CREATE ROLE app_client WITH
    LOGIN                         
    PASSWORD 'secure_password'     
    NOSUPERUSER                    
    NOCREATEDB                     
    NOCREATEROLE                   
    NOINHERIT                      
    NOREPLICATION                 
    CONNECTION LIMIT -1;           


REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM app_client;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM app_client;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM app_client;
REVOKE ALL PRIVILEGES ON SCHEMA public FROM app_client;

GRANT USAGE ON SCHEMA public TO app_client;

GRANT SELECT ON vw_course_performance TO app_client;
GRANT SELECT ON vw_teacher_load TO app_client;
GRANT SELECT ON vw_students_at_risk TO app_client;
GRANT SELECT ON vw_attendance_by_group TO app_client;
GRANT SELECT ON vw_rank_students TO app_client;

-- Query para verificar permisos otorgados:
-- SELECT 
--     grantee,
--     table_schema,
--     table_name,
--     privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'app_client';
