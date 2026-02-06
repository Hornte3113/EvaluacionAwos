import { z } from 'zod';

// Esquema para paginación
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Esquema para filtro de término (obligatorio en performance)
export const TermFilterSchema = z.object({
  term: z.string().min(1, 'El término es obligatorio'),
  program: z.string().optional(),
});

// Esquema para búsqueda de estudiantes
export const SearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Whitelist de programas permitidos
export const ALLOWED_PROGRAMS = ['ISC', 'II', 'IM', 'IGE', 'LA'] as const;

export const ProgramFilterSchema = z.object({
  program: z.enum(ALLOWED_PROGRAMS),
  term: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Esquema para filtro de término simple con paginación
export const TermPaginationSchema = z.object({
  term: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});