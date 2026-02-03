
-- tabla:students(id, name, email, program, enrollment_year)
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    program VARCHAR(50) NOT NULL,
    enrollment_year INTEGER NOT NULL
);

-- talba: teachers(id, name, email)
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
);

-- tabla:courses(id, code, name, credits)

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50)  UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0)
);
-- Tablas que depnden de otras

-- tabla: groups(id, course_id, teacher_id, term)
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL,
    UNIQUE(course_id, teacher_id, term)
    
);

-- tabla: enrollments(id, student_id, group_id, enrolled_at)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, group_id)
    
);
-- tabla: grades(id, enrollment_id, partial1, partial2, final)
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    partial1 DECIMAL(5,2) CHECK(partial1 => 0 AND partial1 <= 100),
    partial2 DECIMAL(5,2) CHECK(partial2 => 0 AND partial2 <= 100),
    final DECIMAL(5,2) CHECK(final => 0 AND final <= 100),
    UNIQUE(enrollment_id)
    
);

-- tabla: attendance(id, enrollment_id, date, present)
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    date NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(enrollment_id, date)
);


