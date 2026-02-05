
-- VIEW 1: vw_course_performance
-- Descripción: Rendimiento académico por curso y término
-- Grain: 1 fila por combinación de curso + término + programa
-- Métricas: 
-- total_students: total de alumnos inscritos
-- avg_grade: promedio general de calificaciones
-- passed_students: cantidad de aprobados (>=60)
-- failed_students: cantidad de reprobados (<60)
-- pass_rate: porcentaje de aprobación
-- excellent_students: cantidad con calificación >=90
-- Filtros: term , program
CREATE OR REPLACE VIEW vw_course_performance AS
SELECT 
    c.id AS course_id,
    c.code AS course_code,
    c.name AS course_name,
    c.credits,
    g.term,
    s.program,
    COUNT(DISTINCT e.student_id) AS total_students,
    ROUND(AVG(gr.final), 2) AS avg_grade,
    COUNT(DISTINCT CASE WHEN gr.final >= 60 THEN e.student_id END) AS passed_students,
    COUNT(DISTINCT CASE WHEN gr.final < 60 THEN e.student_id END) AS failed_students,
    ROUND(
        (COUNT(DISTINCT CASE WHEN gr.final >= 60 THEN e.student_id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT e.student_id), 0)) * 100, 
        2
    ) AS pass_rate,
    COUNT(DISTINCT CASE WHEN gr.final >= 90 THEN e.student_id END) AS excellent_students,
    MIN(gr.final) AS min_grade,
    MAX(gr.final) AS max_grade
FROM courses c
INNER JOIN groups g ON c.id = g.course_id
INNER JOIN enrollments e ON g.id = e.group_id
INNER JOIN students s ON e.student_id = s.id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY c.id, c.code, c.name, c.credits, g.term, s.program
HAVING COUNT(DISTINCT e.student_id) > 0
ORDER BY g.term DESC, c.code, s.program;

-- VERIFY queries:
-- 1. Obtener rendimiento de todos los cursos en término 2024-1
-- SELECT * FROM vw_course_performance WHERE term = '2024-1';

-- 2. Obtener rendimiento del programa ISC en término 2024-1
-- SELECT * FROM vw_course_performance WHERE term = '2024-1' AND program = 'ISC' ORDER BY pass_rate DESC;

-- 3. Cursos con mayor tasa de reprobación
-- SELECT course_name, term, program, pass_rate, failed_students 
-- FROM vw_course_performance 
-- WHERE term = '2024-1' 
-- ORDER BY pass_rate ASC 
-- LIMIT 5;


-- VIEW 2: vw_teacher_load (con HAVING)
-- Descripción: Carga académica por docente y término
-- Grain: 1 fila por docente + término
-- Métricas:
-- total_groups: cantidad de grupos asignados
-- total_students: total de estudiantes bajo su cargo
-- avg_students_per_group: promedio de alumnos por grupo
-- overall_avg_grade: promedio general de calificaciones de sus estudiantes
-- courses_taught: lista de cursos que imparte
-- Filtros: term , paginación (page, limit)
-- HAVING: solo docentes con al menos 1 grupo

CREATE OR REPLACE VIEW vw_teacher_load AS
SELECT 
    t.id AS teacher_id,
    t.name AS teacher_name,
    t.email AS teacher_email,
    g.term,
    COUNT(DISTINCT g.id) AS total_groups,
    COUNT(DISTINCT e.student_id) AS total_students,
    ROUND(COUNT(DISTINCT e.student_id)::DECIMAL / NULLIF(COUNT(DISTINCT g.id), 0), 2) AS avg_students_per_group,
    ROUND(AVG(gr.final), 2) AS overall_avg_grade,
    STRING_AGG(DISTINCT c.code, ', ' ORDER BY c.code) AS courses_taught,
    COUNT(DISTINCT CASE WHEN gr.final >= 60 THEN e.student_id END) AS students_passed,
    COUNT(DISTINCT CASE WHEN gr.final < 60 THEN e.student_id END) AS students_failed
FROM teachers t
INNER JOIN groups g ON t.id = g.teacher_id
INNER JOIN courses c ON g.course_id = c.id
LEFT JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY t.id, t.name, t.email, g.term
HAVING COUNT(DISTINCT g.id) > 0
ORDER BY g.term DESC, total_students DESC;

-- VERIFY queries:
-- 1. Carga docente en término 2024-1
-- SELECT * FROM vw_teacher_load WHERE term = '2024-1' ORDER BY total_students DESC;

-- 2. Docentes con mayor carga (más de 20 estudiantes)
-- SELECT teacher_name, term, total_groups, total_students, courses_taught
-- FROM vw_teacher_load 
-- WHERE total_students > 20
-- ORDER BY total_students DESC;

-- 3. Paginación: primeros 3 resultados del término 2024-1
-- SELECT * FROM vw_teacher_load WHERE term = '2024-1' ORDER BY teacher_name LIMIT 3 OFFSET 0;


-- VIEW 3: vw_students_at_risk (con CTE)
-- Descripción: Estudiantes en riesgo académico por bajo rendimiento o asistencia
-- Grain: 1 fila por estudiante con al menos 1 factor de riesgo
-- Métricas:
--   - avg_grade: promedio de calificaciones del estudiante
--   - attendance_rate: porcentaje de asistencia
--   - total_absences: faltas totales
--   - courses_failed: cantidad de cursos reprobados
--   - risk_level: nivel de riesgo (HIGH, MEDIUM, LOW)
--   - risk_factors: factores de riesgo identificados
-- Filtros esperados: search (name/email), paginación (page, limit)
-- CTE: calcula estadísticas de cada estudiante antes de filtrar

CREATE OR REPLACE VIEW vw_students_at_risk AS
WITH student_stats AS (
    -- CTE: Calcular estadísticas base por estudiante
    SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.program,
        s.enrollment_year,
        COUNT(DISTINCT e.id) AS total_enrollments,
        ROUND(AVG(gr.final), 2) AS avg_grade,
        COUNT(DISTINCT CASE WHEN gr.final < 60 THEN e.id END) AS courses_failed,
        COUNT(a.id) AS total_classes,
        COUNT(CASE WHEN a.present = TRUE THEN 1 END) AS classes_attended,
        COUNT(CASE WHEN a.present = FALSE THEN 1 END) AS total_absences,
        COALESCE(
            ROUND(
                (COUNT(CASE WHEN a.present = TRUE THEN 1 END)::DECIMAL / 
                 NULLIF(COUNT(a.id), 0)) * 100, 
                2
            ),
            0
        ) AS attendance_rate
    FROM students s
    INNER JOIN enrollments e ON s.id = e.student_id
    LEFT JOIN grades gr ON e.id = gr.enrollment_id
    LEFT JOIN attendance a ON e.id = a.enrollment_id
    GROUP BY s.id, s.name, s.email, s.program, s.enrollment_year
)
SELECT 
    student_id,
    student_name,
    student_email,
    program,
    enrollment_year,
    total_enrollments,
    avg_grade,
    attendance_rate,
    total_absences,
    courses_failed,
    -- Campo calculado: nivel de riesgo
    CASE 
        WHEN avg_grade < 60 AND attendance_rate < 60 THEN 'CRITICAL'
        WHEN avg_grade < 60 OR attendance_rate < 60 THEN 'HIGH'
        WHEN avg_grade < 70 OR attendance_rate < 75 THEN 'MEDIUM'
        ELSE 'LOW'
    END AS risk_level,
    -- Campo calculado: factores de riesgo
    CONCAT_WS(', ',
        CASE WHEN avg_grade < 60 THEN 'Promedio bajo (<60)' END,
        CASE WHEN attendance_rate < 60 THEN 'Asistencia crítica (<60%)' END,
        CASE WHEN attendance_rate BETWEEN 60 AND 74.99 THEN 'Asistencia baja (60-75%)' END,
        CASE WHEN courses_failed > 0 THEN CONCAT(courses_failed, ' curso(s) reprobado(s)') END
    ) AS risk_factors
FROM student_stats
WHERE 
    avg_grade < 75 OR attendance_rate < 80 OR courses_failed > 0
ORDER BY 
    CASE 
        WHEN avg_grade < 60 AND attendance_rate < 60 THEN 1
        WHEN avg_grade < 60 OR attendance_rate < 60 THEN 2
        WHEN avg_grade < 70 OR attendance_rate < 75 THEN 3
        ELSE 4
    END,
    avg_grade ASC,
    attendance_rate ASC;

-- VERIFY queries:
-- 1. Todos los estudiantes en riesgo
-- SELECT * FROM vw_students_at_risk;

-- 2. Búsqueda por nombre (case insensitive)
-- SELECT * FROM vw_students_at_risk WHERE LOWER(student_name) LIKE LOWER('%luis%');

-- 3. Estudiantes en riesgo CRÍTICO o ALTO
-- SELECT student_name, program, avg_grade, attendance_rate, risk_level, risk_factors
-- FROM vw_students_at_risk 
-- WHERE risk_level IN ('CRITICAL', 'HIGH')
-- ORDER BY risk_level;

-- 4. Paginación: primeros 5 resultados
-- SELECT * FROM vw_students_at_risk ORDER BY student_name LIMIT 5 OFFSET 0;


-- ============================================
-- VIEW 4: vw_attendance_by_group (con CASE/COALESCE)
-- ============================================
-- Descripción: Estadísticas de asistencia por grupo
-- Grain: 1 fila por grupo (course + teacher + term)
-- Métricas:
--   - total_students: total de estudiantes inscritos
--   - total_classes: cantidad de clases registradas
--   - avg_attendance_rate: promedio de asistencia del grupo
--   - students_good_attendance: estudiantes con >80% asistencia
--   - students_poor_attendance: estudiantes con <70% asistencia
--   - attendance_category: categorización del grupo (EXCELLENT, GOOD, REGULAR, POOR)
-- Filtros esperados: term
-- CASE/COALESCE: manejo de valores nulos y categorización
CREATE OR REPLACE VIEW vw_attendance_by_group AS
WITH student_attendance_rates AS (
    -- CTE: Calcular tasa de asistencia por estudiante
    SELECT 
        e.id AS enrollment_id,
        e.group_id,
        COUNT(a.id) AS total_classes_student,
        COUNT(CASE WHEN a.present = TRUE THEN 1 END) AS classes_attended,
        COALESCE(
            ROUND(
                (COUNT(CASE WHEN a.present = TRUE THEN 1 END)::DECIMAL / 
                 NULLIF(COUNT(a.id), 0)) * 100,
                2
            ),
            0
        ) AS attendance_rate
    FROM enrollments e
    LEFT JOIN attendance a ON e.id = a.enrollment_id
    GROUP BY e.id, e.group_id
)
SELECT 
    g.id AS group_id,
    c.code AS course_code,
    c.name AS course_name,
    t.name AS teacher_name,
    g.term,
    COUNT(DISTINCT e.student_id) AS total_students,
    COALESCE(MAX(sar.total_classes_student), 0) AS total_classes,
    COALESCE(ROUND(AVG(sar.attendance_rate), 2), 0) AS avg_attendance_rate,
    COUNT(DISTINCT CASE WHEN sar.attendance_rate > 80 THEN e.student_id END) AS students_good_attendance,
    COUNT(DISTINCT CASE WHEN sar.attendance_rate < 70 THEN e.student_id END) AS students_poor_attendance,
 
    CASE 
        WHEN COALESCE(AVG(sar.attendance_rate), 0) >= 90 THEN 'EXCELLENT'
        WHEN COALESCE(AVG(sar.attendance_rate), 0) >= 80 THEN 'GOOD'
        WHEN COALESCE(AVG(sar.attendance_rate), 0) >= 70 THEN 'REGULAR'
        ELSE 'POOR'
    END AS attendance_category
FROM groups g
INNER JOIN courses c ON g.course_id = c.id
INNER JOIN teachers t ON g.teacher_id = t.id
INNER JOIN enrollments e ON g.id = e.group_id
LEFT JOIN student_attendance_rates sar ON e.id = sar.enrollment_id
GROUP BY g.id, c.code, c.name, t.name, g.term
HAVING COUNT(DISTINCT e.student_id) > 0
ORDER BY g.term DESC, avg_attendance_rate DESC;

-- VERIFY queries:
-- 1. Asistencia por grupo en término 2024-1
-- SELECT * FROM vw_attendance_by_group WHERE term = '2024-1';

-- 2. Grupos con asistencia problemática (<75%)
-- SELECT course_name, teacher_name, term, total_students, avg_attendance_rate, attendance_category
-- FROM vw_attendance_by_group 
-- WHERE avg_attendance_rate < 75
-- ORDER BY avg_attendance_rate ASC;


-- VIEW 5: vw_rank_students (con Window Functions)
-- Descripción: es el ranking de estudiantes por rendimiento académico
-- Grain: 1 fila por estudiante + programa + término
-- Métricas:
--   - avg_grade: promedio de calificaciones
--   - rank_in_program: posición en el programa (RANK)
--   - row_number_in_program: número de fila sin empates (ROW_NUMBER)
--   - percentile: percentil en el que se encuentra
--   - courses_taken: cantidad de cursos inscritos
--   - gpa_category: categorización del GPA
-- Window Functions: RANK(), ROW_NUMBER(), PERCENT_RANK()
-- Filtros esperados: program (whitelist), term (opcional)

CREATE OR REPLACE VIEW vw_rank_students AS
WITH student_grades_by_term AS (
    SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.email AS student_email,
        s.program,
        g.term,
        COUNT(DISTINCT e.id) AS courses_taken,
        ROUND(AVG(gr.final), 2) AS avg_grade,
        SUM(c.credits) AS total_credits
    FROM students s
    INNER JOIN enrollments e ON s.id = e.student_id
    INNER JOIN groups g ON e.group_id = g.id
    INNER JOIN courses c ON g.course_id = c.id
    LEFT JOIN grades gr ON e.id = gr.enrollment_id
    WHERE gr.final IS NOT NULL
    GROUP BY s.id, s.name, s.email, s.program, g.term
)
SELECT 
    student_id,
    student_name,
    student_email,
    program,
    term,
    courses_taken,
    total_credits,
    avg_grade,
    -- Window Function: RANK (permite empates)
    RANK() OVER (
        PARTITION BY program, term 
        ORDER BY avg_grade DESC
    ) AS rank_in_program,
    -- Window Function: ROW_NUMBER (sin empates)
    ROW_NUMBER() OVER (
        PARTITION BY program, term 
        ORDER BY avg_grade DESC, student_name
    ) AS row_number_in_program,
    -- Window Function: PERCENT_RANK (percentil)
    ROUND(
        PERCENT_RANK() OVER (
            PARTITION BY program, term 
            ORDER BY avg_grade DESC
        ) * 100,
        2
    ) AS percentile,
    -- Window Function: Total de estudiantes en el programa/término
    COUNT(*) OVER (PARTITION BY program, term) AS total_students_in_program,
    -- Campo calculado: categoría de GPA
    CASE 
        WHEN avg_grade >= 90 THEN 'EXCELLENT (A)'
        WHEN avg_grade >= 80 THEN 'GOOD (B)'
        WHEN avg_grade >= 70 THEN 'SATISFACTORY (C)'
        WHEN avg_grade >= 60 THEN 'PASSING (D)'
        ELSE 'FAILING (F)'
    END AS gpa_category
FROM student_grades_by_term
ORDER BY program, term DESC, rank_in_program;

-- VERIFY queries:
-- 1. Ranking completo del programa ISC en término 2024-1
-- SELECT * FROM vw_rank_students WHERE program = 'ISC' AND term = '2024-1';

-- 2. Top 5 estudiantes por programa en 2024-1
-- SELECT program, rank_in_program, student_name, avg_grade, gpa_category
-- FROM vw_rank_students 
-- WHERE term = '2024-1' AND rank_in_program <= 5
-- ORDER BY program, rank_in_program;

-- 3. Estudiantes en el top 10% de su programa
-- SELECT student_name, program, term, avg_grade, percentile, gpa_category
-- FROM vw_rank_students 
-- WHERE percentile <= 10
-- ORDER BY program, term DESC, percentile;
