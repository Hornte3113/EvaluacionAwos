-- ÍNDICE 1: groups(term)
-- Propósito: Acelerar filtros por término académico
-- Usado en: vw_course_performance, vw_teacher_load, vw_attendance_by_group, vw_rank_students
-- Razón: La columna 'term' la uso mucho en  WHERE clauses
-- Tipo: B-tree (default para búsquedas de igualdad y rangos)

CREATE INDEX IF NOT EXISTS idx_groups_term 
ON groups(term);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM groups WHERE term = '2024-1';
-- Sin índice: Seq Scan en toda la tabla
-- Con índice: Index Scan, mucho más rápido


-- ÍNDICE 2: students(program)
-- Propósito: Acelerar filtros por programa académico (ISC, IND, ADM)
-- Usado en: vw_course_performance, vw_rank_students
-- Razón: Filtros frecuentes por programa + cardinalidad baja (3 valores únicos)

CREATE INDEX IF NOT EXISTS idx_students_program 
ON students(program);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM students WHERE program = 'ISC';

----------otrp

-- ÍNDICE 3: enrollments(student_id, group_id)
-- Propósito: Optimizar JOINs entre students ↔ enrollments ↔ groups
-- Usado en: Todas las VIEWS (enrollments es tabla central)
-- Razón: Estos campos se usan constantemente en JOINs y GROUP BY
-- Beneficio: Cubre tanto búsquedas por student_id como por group_id


CREATE INDEX IF NOT EXISTS idx_enrollments_student_group 
ON enrollments(student_id, group_id);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT e.* FROM enrollments e 
-- INNER JOIN students s ON e.student_id = s.id 
-- WHERE s.program = 'ISC';

-- ÍNDICE 4: grades(enrollment_id)
-- Propósito: Acelerar JOINs con la tabla grades
-- Usado en: Todas las VIEWS que consultan calificaciones
-- Razón: grades se une frecuentemente con enrollments vía enrollment_id
-- Nota: en teoria ya existe UNIQUE(enrollment_id) que crea un índice automático,
--       pero para probarlo lo voy a poner tambien

-- Ya existe un índice único automático por UNIQUE(enrollment_id)
-- Pero si no existiera, sería:
-- CREATE INDEX IF NOT EXISTS idx_grades_enrollment 
-- ON grades(enrollment_id);



-- ÍNDICE 5: attendance(enrollment_id, date)
-- Propósito: Optimizar consultas de asistencia por inscripción y fecha
-- Usado en: vw_students_at_risk, vw_attendance_by_group
-- Razón: Se consulta asistencia agrupada por enrollment y ordenada por fecha
-- Tipo: Índice compuesto
-- Beneficio: Permite búsquedas rápidas y ordenamiento eficiente

CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_date 
ON attendance(enrollment_id, date);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM attendance 
-- WHERE enrollment_id = 10 
-- ORDER BY date DESC;


-- ÍNDICE 6: Índice compuesto para búsqueda de estudiantes
-- Propósito: Acelerar búsquedas por nombre o email (case-insensitive)
-- Usado en: vw_students_at_risk con búsqueda ILIKE
-- Razón: La búsqueda de texto es lenta sin índices especializados
-- este es un indice de texto con LOWER() para búsquedas case-insensitive

CREATE INDEX IF NOT EXISTS idx_students_name_lower 
ON students(LOWER(name));

CREATE INDEX IF NOT EXISTS idx_students_email_lower 
ON students(LOWER(email));

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM students 
-- WHERE LOWER(name) LIKE LOWER('%juan%');


-- ÍNDICE 7: groups(course_id, teacher_id, term)
-- Propósito: Acelerar consultas que filtran por curso, profesor y término
-- Usado en: vw_teacher_load, vw_course_performance
-- Razón: Esta combinación se usa frecuentemente en agrupaciones

CREATE INDEX IF NOT EXISTS idx_groups_course_teacher_term 
ON groups(course_id, teacher_id, term);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM groups 
-- WHERE course_id = 1 AND teacher_id = 1 AND term = '2024-1';


-- ÍNDICE 8: attendance(date) para filtros por rango de fechas
-- Propósito: Acelerar consultas por rango de fechas
-- Usado en: Reportes de asistencia por periodo
-- Razón: Permite búsquedas eficientes por fecha

CREATE INDEX IF NOT EXISTS idx_attendance_date 
ON attendance(date);

-- EXPLAIN de ejemplo:
-- EXPLAIN ANALYZE 
-- SELECT * FROM attendance 
-- WHERE date BETWEEN '2024-01-01' AND '2024-01-31';







-- verificación de los indices creados
-- Query para listar todos los índices de las tablas
-- Ejecutar esto para verificar que los índices se crearon correctamente:

-- SELECT 
--     tablename, 
--     indexname, 
--     indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;


-- ============================================
-- ANÁLISIS DE RENDIMIENTO
-- ============================================
-- Para medir el impacto de los índices, ejecuta queries con EXPLAIN ANALYZE:

-- 1. Query SIN índices (simular borrando índice temporalmente):
-- DROP INDEX idx_groups_term;
-- EXPLAIN ANALYZE SELECT * FROM vw_course_performance WHERE term = '2024-1';
-- Resultado esperado: Seq Scan (escaneo secuencial completo)

-- 2. Query CON índices:
-- CREATE INDEX idx_groups_term ON groups(term);
-- EXPLAIN ANALYZE SELECT * FROM vw_course_performance WHERE term = '2024-1';
-- Resultado esperado: Index Scan (mucho más rápido)

-- esto actualiza las estadisticas para que el query planner tome mejores decisiones:

ANALYZE students;
ANALYZE teachers;
ANALYZE courses;
ANALYZE groups;
ANALYZE enrollments;
ANALYZE grades;
ANALYZE attendance;