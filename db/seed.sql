TRUNCATE TABLE attendance, grades, enrollments, groups, courses, teachers, students RESTART IDENTITY CASCADE;

--  estudientes (15 estudiantes en 3 programas)
INSERT INTO students (name, email, program, enrollment_year) VALUES
-- Ingeniería en Sistemas (ISC)
('Juan Pérez García', 'juan.perez@mail.com', 'ISC', 2022),
('María López Martínez', 'maria.lopez@mail.com', 'ISC', 2023),
('Carlos Rodríguez Sánchez', 'carlos.rodriguez@mail.com', 'ISC', 2023),
('Ana Hernández Torres', 'ana.hernandez@mail.com', 'ISC', 2024),
('Luis Nafa Ramírez', 'luis.nafa@mail.com', 'ISC', 2024),

-- Ingeniería Industrial (IND)
('Sofia Martínez Cruz', 'sofia.martinez@mail.com', 'IND', 2022),
('Pedro Sánchez López', 'pedro.sanchez@mail.com', 'IND', 2023),
('Laura Díaz Fernández', 'laura.diaz@mail.com', 'IND', 2023),
('Diego Torres Ruiz', 'diego.torres@mail.com', 'IND', 2024),
('Valentina Ramírez Castro', 'valentina.ramirez@mail.com', 'IND', 2024),

-- Administración de Empresas (ADM)
('Miguel Flores Ortiz', 'miguel.flores@mail.com', 'ADM', 2022),
('Carmen Vargas Medina', 'carmen.vargas@mail.com', 'ADM', 2023),
('Roberto Mendoza Silva', 'roberto.mendoza@mail.com', 'ADM', 2023),
('Patricia Ramos Núñez', 'patricia.ramos@mail.com', 'ADM', 2024),
('Fernando Castro Morales', 'fernando.castro@mail.com', 'ADM', 2024);

-- ============================================
-- 2. PROFESORES (5 profesores)
-- ============================================
INSERT INTO teachers (name, email) VALUES
('Dr. Alberto Gutiérrez', 'alberto.gutierrez@university.edu'),
('Dra. Beatriz Moreno', 'beatriz.moreno@university.edu'),
('Mtro. Rodolfo Ramirez', 'rodolfo.ramirez@university.edu'),
('Dra. Diana Paredes', 'diana.paredes@university.edu'),
('Mtro. Eduardo Salinas', 'eduardo.salinas@university.edu');

-- ============================================
-- 3. CURSOS (8 cursos)
-- ============================================
INSERT INTO courses (code, name, credits) VALUES
('MAT101', 'Cálculo Diferencial', 6),
('PRG101', 'Programación I', 8),
('BDA101', 'Bases de Datos', 6),
('EST101', 'Estadística', 6),
('CON101', 'Contabilidad Básica', 4),
('ADM101', 'Administración General', 5),
('ING101', 'Inglés I', 3),
('FIS101', 'Física I', 6);

-- ============================================
-- 4. GRUPOS (20 grupos en 3 términos)
-- ============================================
-- Formato: course_id, teacher_id, term

-- Término 2024-1 (8 grupos)
INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 1, '2024-1'), -- MAT101 con Dr. Alberto
(2, 2, '2024-1'), -- PRG101 con Dra. Beatriz
(3, 3, '2024-1'), -- BDA101 con Mtro. César
(4, 4, '2024-1'), -- EST101 con Dra. Diana
(5, 5, '2024-1'), -- CON101 con Mtro. Eduardo
(6, 1, '2024-1'), -- ADM101 con Dr. Alberto
(7, 2, '2024-1'), -- ING101 con Dra. Beatriz
(8, 3, '2024-1'); -- FIS101 con Mtro. César

-- Término 2024-2 (8 grupos)
INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 2, '2024-2'), -- MAT101 con Dra. Beatriz
(2, 3, '2024-2'), -- PRG101 con Mtro. César
(3, 4, '2024-2'), -- BDA101 con Dra. Diana
(4, 5, '2024-2'), -- EST101 con Mtro. Eduardo
(5, 1, '2024-2'), -- CON101 con Dr. Alberto
(6, 2, '2024-2'), -- ADM101 con Dra. Beatriz
(7, 3, '2024-2'), -- ING101 con Mtro. César
(8, 4, '2024-2'); -- FIS101 con Dra. Diana

-- Término 2025-1 (4 grupos - actual)
INSERT INTO groups (course_id, teacher_id, term) VALUES
(1, 1, '2025-1'), -- MAT101 con Dr. Alberto
(2, 2, '2025-1'), -- PRG101 con Dra. Beatriz
(3, 3, '2025-1'), -- BDA101 con Mtro. César
(4, 4, '2025-1'); -- EST101 con Dra. Diana

-- ============================================
-- 5. INSCRIPCIONES 
-- ============================================

-- Término 2024-1
-- Grupo 1 (MAT101) - 5 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(1, 1, '2024-01-10 08:00:00'),
(2, 1, '2024-01-10 08:15:00'),
(3, 1, '2024-01-10 09:00:00'),
(6, 1, '2024-01-10 10:00:00'),
(11, 1, '2024-01-10 11:00:00');

-- Grupo 2 (PRG101) - 6 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(1, 2, '2024-01-10 08:00:00'),
(2, 2, '2024-01-10 08:15:00'),
(3, 2, '2024-01-10 09:00:00'),
(4, 2, '2024-01-10 10:00:00'),
(5, 2, '2024-01-10 11:00:00'),
(7, 2, '2024-01-10 12:00:00');

-- Grupo 3 (BDA101) - 5 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(1, 3, '2024-01-10 08:00:00'),
(2, 3, '2024-01-10 08:15:00'),
(6, 3, '2024-01-10 09:00:00'),
(7, 3, '2024-01-10 10:00:00'),
(8, 3, '2024-01-10 11:00:00');

-- Grupo 4 (EST101) - 4 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(3, 4, '2024-01-10 08:00:00'),
(6, 4, '2024-01-10 08:15:00'),
(11, 4, '2024-01-10 09:00:00'),
(12, 4, '2024-01-10 10:00:00');

-- Grupo 5 (CON101) - 5 estudiantes ADM
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(11, 5, '2024-01-10 08:00:00'),
(12, 5, '2024-01-10 08:15:00'),
(13, 5, '2024-01-10 09:00:00'),
(14, 5, '2024-01-10 10:00:00'),
(15, 5, '2024-01-10 11:00:00');

-- Grupo 6 (ADM101) - 6 estudiantes IND+ADM
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(6, 6, '2024-01-10 08:00:00'),
(7, 6, '2024-01-10 08:15:00'),
(8, 6, '2024-01-10 09:00:00'),
(11, 6, '2024-01-10 10:00:00'),
(12, 6, '2024-01-10 11:00:00'),
(13, 6, '2024-01-10 12:00:00');

-- Término 2024-2
-- Grupo 9 (MAT101) - 4 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(4, 9, '2024-08-10 08:00:00'),
(5, 9, '2024-08-10 08:15:00'),
(9, 9, '2024-08-10 09:00:00'),
(10, 9, '2024-08-10 10:00:00');

-- Grupo 10 (PRG101) - 5 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(4, 10, '2024-08-10 08:00:00'),
(5, 10, '2024-08-10 08:15:00'),
(8, 10, '2024-08-10 09:00:00'),
(9, 10, '2024-08-10 10:00:00'),
(10, 10, '2024-08-10 11:00:00');

-- Grupo 11 (BDA101) - 4 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(3, 11, '2024-08-10 08:00:00'),
(4, 11, '2024-08-10 08:15:00'),
(9, 11, '2024-08-10 09:00:00'),
(14, 11, '2024-08-10 10:00:00');

-- Término 2025-1 (Actual)
-- Grupo 17 (MAT101) - 5 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(5, 17, '2025-01-10 08:00:00'),
(9, 17, '2025-01-10 08:15:00'),
(10, 17, '2025-01-10 09:00:00'),
(14, 17, '2025-01-10 10:00:00'),
(15, 17, '2025-01-10 11:00:00');

-- Grupo 18 (PRG101) - 4 estudiantes
INSERT INTO enrollments (student_id, group_id, enrolled_at) VALUES
(9, 18, '2025-01-10 08:00:00'),
(10, 18, '2025-01-10 08:15:00'),
(14, 18, '2025-01-10 09:00:00'),
(15, 18, '2025-01-10 10:00:00');

-- ============================================
-- 6. CALIFICACIONES (grades)
-- ============================================
-- Casos variados: aprobados, reprobados, excelentes

-- Término 2024-1 - Grupo 1 (MAT101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(1, 85.50, 88.00, 90.00),  -- Juan - EXCELENTE
(2, 72.00, 75.00, 78.00),  -- María - APROBADO
(3, 55.00, 58.00, 60.00),  -- Carlos - APENAS APROBADO
(4, 45.00, 48.00, 50.00),  -- Sofia (IND) - REPROBADO
(5, 90.00, 92.00, 95.00);  -- Miguel (ADM) - EXCELENTE

-- Término 2024-1 - Grupo 2 (PRG101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(6, 88.00, 90.00, 92.00),   -- Juan - EXCELENTE
(7, 70.00, 72.00, 75.00),   -- María - APROBADO
(8, 50.00, 52.00, 55.00),   -- Carlos - REPROBADO
(9, 60.00, 65.00, 70.00),   -- Ana - APROBADO
(10, 45.00, 40.00, 42.00),  -- Luis - REPROBADO
(11, 78.00, 80.00, 82.00);  -- Pedro - APROBADO

-- Término 2024-1 - Grupo 3 (BDA101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(12, 92.00, 94.00, 96.00),  -- Juan - EXCELENTE
(13, 68.00, 70.00, 72.00),  -- María - APROBADO
(14, 75.00, 78.00, 80.00),  -- Sofia - APROBADO
(15, 82.00, 85.00, 88.00),  -- Pedro - EXCELENTE
(16, 58.00, 60.00, 62.00);  -- Laura - APENAS APROBADO

-- Término 2024-1 - Grupo 4 (EST101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(17, 70.00, 72.00, 75.00),  -- Carlos - APROBADO
(18, 80.00, 82.00, 85.00),  -- Sofia - EXCELENTE
(19, 65.00, 68.00, 70.00),  -- Miguel - APROBADO
(20, 55.00, 58.00, 60.00);  -- Carmen - APENAS APROBADO

-- Término 2024-1 - Grupo 5 (CON101) - Estudiantes ADM
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(21, 88.00, 90.00, 92.00),  -- Miguel - EXCELENTE
(22, 75.00, 78.00, 80.00),  -- Carmen - APROBADO
(23, 70.00, 72.00, 75.00),  -- Roberto - APROBADO
(24, 85.00, 88.00, 90.00),  -- Patricia - EXCELENTE
(25, 60.00, 62.00, 65.00);  -- Fernando - APENAS APROBADO

-- Término 2024-1 - Grupo 6 (ADM101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(26, 78.00, 80.00, 82.00),  -- Sofia (IND) - APROBADO
(27, 72.00, 75.00, 78.00),  -- Pedro (IND) - APROBADO
(28, 68.00, 70.00, 72.00),  -- Laura (IND) - APROBADO
(29, 90.00, 92.00, 95.00),  -- Miguel (ADM) - EXCELENTE
(30, 82.00, 85.00, 88.00),  -- Carmen (ADM) - EXCELENTE
(31, 75.00, 78.00, 80.00);  -- Roberto (ADM) - APROBADO

-- Término 2024-2 - Grupo 9 (MAT101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(32, 65.00, 68.00, 70.00),  -- Ana - APROBADO
(33, 58.00, 60.00, 62.00),  -- Luis - APENAS APROBADO
(34, 75.00, 78.00, 80.00),  -- Diego - APROBADO
(35, 70.00, 72.00, 75.00);  -- Valentina - APROBADO

-- Término 2024-2 - Grupo 10 (PRG101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(36, 80.00, 82.00, 85.00),  -- Ana - EXCELENTE
(37, 72.00, 75.00, 78.00),  -- Luis - APROBADO
(38, 88.00, 90.00, 92.00),  -- Laura - EXCELENTE
(39, 78.00, 80.00, 82.00),  -- Diego - APROBADO
(40, 85.00, 88.00, 90.00);  -- Valentina - EXCELENTE

-- Término 2024-2 - Grupo 11 (BDA101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(41, 70.00, 72.00, 75.00),  -- Carlos - APROBADO
(42, 75.00, 78.00, 80.00),  -- Ana - APROBADO
(43, 82.00, 85.00, 88.00),  -- Diego - EXCELENTE
(44, 90.00, 92.00, 95.00);  -- Patricia - EXCELENTE

-- Término 2025-1 (Actual) - Grupo 17 (MAT101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(45, 75.00, 78.00, 80.00),  -- Luis - APROBADO
(46, 82.00, 85.00, 88.00),  -- Diego - EXCELENTE
(47, 88.00, 90.00, 92.00),  -- Valentina - EXCELENTE
(48, 65.00, 68.00, 70.00),  -- Patricia - APROBADO
(49, 70.00, 72.00, 75.00);  -- Fernando - APROBADO

-- Término 2025-1 - Grupo 18 (PRG101)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(50, 85.00, 88.00, 90.00),  -- Diego - EXCELENTE
(51, 78.00, 80.00, 82.00),  -- Valentina - APROBADO
(52, 92.00, 94.00, 96.00),  -- Patricia - EXCELENTE
(53, 68.00, 70.00, 72.00);  -- Fernando - APROBADO

-- ============================================
-- 7. ASISTENCIAS (attendance)
-- ============================================
-- 20 días de clases por grupo (simulando un semestre)
-- Casos: estudiantes con buena asistencia, regular, mala

-- Función auxiliar para generar fechas de asistencia
-- Grupo 1 (MAT101 2024-1) - 20 clases de enero a mayo 2024

-- Juan (enrollment_id=1) - EXCELENTE ASISTENCIA (95%)
INSERT INTO attendance (enrollment_id, date, present) VALUES
(1, '2024-01-15', TRUE), (1, '2024-01-17', TRUE), (1, '2024-01-22', TRUE),
(1, '2024-01-24', TRUE), (1, '2024-01-29', TRUE), (1, '2024-01-31', TRUE),
(1, '2024-02-05', TRUE), (1, '2024-02-07', TRUE), (1, '2024-02-12', TRUE),
(1, '2024-02-14', TRUE), (1, '2024-02-19', TRUE), (1, '2024-02-21', TRUE),
(1, '2024-02-26', TRUE), (1, '2024-02-28', TRUE), (1, '2024-03-04', TRUE),
(1, '2024-03-06', TRUE), (1, '2024-03-11', TRUE), (1, '2024-03-13', TRUE),
(1, '2024-03-18', TRUE), (1, '2024-03-20', FALSE); -- 19/20 = 95%

-- María (enrollment_id=2) - BUENA ASISTENCIA (80%)
INSERT INTO attendance (enrollment_id, date, present) VALUES
(2, '2024-01-15', TRUE), (2, '2024-01-17', TRUE), (2, '2024-01-22', FALSE),
(2, '2024-01-24', TRUE), (2, '2024-01-29', TRUE), (2, '2024-01-31', FALSE),
(2, '2024-02-05', TRUE), (2, '2024-02-07', TRUE), (2, '2024-02-12', TRUE),
(2, '2024-02-14', TRUE), (2, '2024-02-19', TRUE), (2, '2024-02-21', TRUE),
(2, '2024-02-26', FALSE), (2, '2024-02-28', TRUE), (2, '2024-03-04', TRUE),
(2, '2024-03-06', TRUE), (2, '2024-03-11', FALSE), (2, '2024-03-13', TRUE),
(2, '2024-03-18', TRUE), (2, '2024-03-20', TRUE); -- 16/20 = 80%

-- Carlos (enrollment_id=3) - MALA ASISTENCIA (60%) - ESTUDIANTE EN RIESGO
INSERT INTO attendance (enrollment_id, date, present) VALUES
(3, '2024-01-15', TRUE), (3, '2024-01-17', FALSE), (3, '2024-01-22', TRUE),
(3, '2024-01-24', FALSE), (3, '2024-01-29', TRUE), (3, '2024-01-31', FALSE),
(3, '2024-02-05', FALSE), (3, '2024-02-07', TRUE), (3, '2024-02-12', TRUE),
(3, '2024-02-14', FALSE), (3, '2024-02-19', TRUE), (3, '2024-02-21', FALSE),
(3, '2024-02-26', TRUE), (3, '2024-02-28', FALSE), (3, '2024-03-04', TRUE),
(3, '2024-03-06', FALSE), (3, '2024-03-11', TRUE), (3, '2024-03-13', TRUE),
(3, '2024-03-18', FALSE), (3, '2024-03-20', TRUE); -- 12/20 = 60%

-- Sofia (enrollment_id=4) - MUY MALA ASISTENCIA (50%) - ALTO RIESGO
INSERT INTO attendance (enrollment_id, date, present) VALUES
(4, '2024-01-15', FALSE), (4, '2024-01-17', TRUE), (4, '2024-01-22', FALSE),
(4, '2024-01-24', TRUE), (4, '2024-01-29', FALSE), (4, '2024-01-31', TRUE),
(4, '2024-02-05', FALSE), (4, '2024-02-07', FALSE), (4, '2024-02-12', TRUE),
(4, '2024-02-14', FALSE), (4, '2024-02-19', TRUE), (4, '2024-02-21', FALSE),
(4, '2024-02-26', TRUE), (4, '2024-02-28', FALSE), (4, '2024-03-04', FALSE),
(4, '2024-03-06', TRUE), (4, '2024-03-11', FALSE), (4, '2024-03-13', TRUE),
(4, '2024-03-18', FALSE), (4, '2024-03-20', TRUE); -- 10/20 = 50%

-- Miguel (enrollment_id=5) - EXCELENTE ASISTENCIA (100%)
INSERT INTO attendance (enrollment_id, date, present) VALUES
(5, '2024-01-15', TRUE), (5, '2024-01-17', TRUE), (5, '2024-01-22', TRUE),
(5, '2024-01-24', TRUE), (5, '2024-01-29', TRUE), (5, '2024-01-31', TRUE),
(5, '2024-02-05', TRUE), (5, '2024-02-07', TRUE), (5, '2024-02-12', TRUE),
(5, '2024-02-14', TRUE), (5, '2024-02-19', TRUE), (5, '2024-02-21', TRUE),
(5, '2024-02-26', TRUE), (5, '2024-02-28', TRUE), (5, '2024-03-04', TRUE),
(5, '2024-03-06', TRUE), (5, '2024-03-11', TRUE), (5, '2024-03-13', TRUE),
(5, '2024-03-18', TRUE), (5, '2024-03-20', TRUE); -- 20/20 = 100%

-- Grupo 2 (PRG101 2024-1) 
-- Luis (enrollment_id=10) - CRÍTICO: BAJO RENDIMIENTO + MALA ASISTENCIA
INSERT INTO attendance (enrollment_id, date, present) VALUES
(10, '2024-01-16', FALSE), (10, '2024-01-18', FALSE), (10, '2024-01-23', TRUE),
(10, '2024-01-25', FALSE), (10, '2024-01-30', TRUE), (10, '2024-02-01', FALSE),
(10, '2024-02-06', FALSE), (10, '2024-02-08', TRUE), (10, '2024-02-13', FALSE),
(10, '2024-02-15', FALSE), (10, '2024-02-20', TRUE), (10, '2024-02-22', FALSE),
(10, '2024-02-27', TRUE), (10, '2024-02-29', FALSE), (10, '2024-03-05', FALSE),
(10, '2024-03-07', TRUE), (10, '2024-03-12', FALSE), (10, '2024-03-14', TRUE),
(10, '2024-03-19', FALSE), (10, '2024-03-21', TRUE); -- 8/20 = 40% CRÍTICO

-- Asistencias para término 2025-1 (grupo actual)
-- Luis en MAT101 (enrollment_id=45) - Mejorando
INSERT INTO attendance (enrollment_id, date, present) VALUES
(45, '2025-01-13', TRUE), (45, '2025-01-15', TRUE), (45, '2025-01-20', TRUE),
(45, '2025-01-22', FALSE), (45, '2025-01-27', TRUE), (45, '2025-01-29', TRUE);

-- Diego (enrollment_id=46) - Excelente
INSERT INTO attendance (enrollment_id, date, present) VALUES
(46, '2025-01-13', TRUE), (46, '2025-01-15', TRUE), (46, '2025-01-20', TRUE),
(46, '2025-01-22', TRUE), (46, '2025-01-27', TRUE), (46, '2025-01-29', TRUE);

-- Fernando (enrollment_id=49) - En riesgo por asistencia
INSERT INTO attendance (enrollment_id, date, present) VALUES
(49, '2025-01-13', FALSE), (49, '2025-01-15', TRUE), (49, '2025-01-20', FALSE),
(49, '2025-01-22', TRUE), (49, '2025-01-27', FALSE), (49, '2025-01-29', TRUE);

-- ============================================
-- FIN DEL SEED
-- ============================================
-- Resumen de datos insertados:
-- - 15 estudiantes (5 ISC, 5 IND, 5 ADM)
-- - 5 profesores
-- - 8 cursos
-- - 20 grupos (8 en 2024-1, 8 en 2024-2, 4 en 2025-1)
-- - 53 inscripciones
-- - 53 registros de calificaciones
-- - 125 registros de asistencia
-- ============================================