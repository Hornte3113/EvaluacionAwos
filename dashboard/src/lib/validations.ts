import { z } from 'zod';


export const VALID_PROGRAMS = ['ISC', 'IND', 'ADM'] as const;


export const VALID_TERMS = ['2024-1', '2024-2', '2025-1'] as const;

// Schema para filtro de término 
export const termFilterSchema = z.object({
  term: z.enum(VALID_TERMS, {
    errorMap: () => ({ message: 'Término inválido. Usa: 2024-1, 2024-2, o 2025-1' }),
  }),
});

// Schema para filtro de programa (whitelist)
export const programFilterSchema = z.object({
  program: z.enum(VALID_PROGRAMS, {
    errorMap: () => ({ message: 'Programa inválido. Usa: ISC, IND, o ADM' }),
  }),
});

// Schema para paginación
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(1000)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().min(1).max(100)),
});

// Schema para búsqueda de texto
export const searchSchema = z.object({
  search: z.string().min(1).max(100).optional(),
});

// Schema combinado: CoursePerformance (term obligatorio, program opcional)
export const coursePerformanceFiltersSchema = z.object({
  term: z.enum(VALID_TERMS),
  program: z.enum(VALID_PROGRAMS).optional(),
});

// Schema combinado: TeacherLoad (term opcional, paginación)
export const teacherLoadFiltersSchema = paginationSchema.extend({
  term: z.enum(VALID_TERMS).optional(),
});

// Schema combinado: StudentsAtRisk (búsqueda y paginación)
export const studentsAtRiskFiltersSchema = paginationSchema.extend({
  search: z.string().min(1).max(100).optional(),
});

// Schema combinado: AttendanceByGroup (term obligatorio)
export const attendanceFiltersSchema = z.object({
  term: z.enum(VALID_TERMS),
});

// Schema combinado: StudentRanking (program obligatorio, term opcional)
export const rankingFiltersSchema = z.object({
  program: z.enum(VALID_PROGRAMS),
  term: z.enum(VALID_TERMS).optional(),
});