// src/services/rankingService.ts
import { query } from '@/lib/db';
import { StudentRanking } from '@/types/reports';

export async function getRankingReport(
  program: string,
  term: string | undefined,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;

  // 1. Query para contar total (Necesario para la paginación)
  let countQuery = `SELECT COUNT(*) as total FROM vw_rank_students WHERE program = $1`;
  const countParams: any[] = [program];

  if (term) {
    countQuery += ` AND term = $2`;
    countParams.push(term);
  }

  const countResult = await query<{ total: string }>(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  // 2. Query principal de datos
  let sqlQuery = `SELECT * FROM vw_rank_students WHERE program = $1`;
  const params: any[] = [program];

  if (term) {
    sqlQuery += ` AND term = $2`;
    params.push(term);
  }

  // Manejo dinámico de índices de parámetros ($1, $2, etc.)
  sqlQuery += ` ORDER BY rank_in_program ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const raw = await query<StudentRanking>(sqlQuery, params);

  // 3. Transformación de datos
  const data = raw.map(row => ({
    ...row,
    courses_taken: Number(row.courses_taken),
    total_credits: Number(row.total_credits),
    avg_grade: Number(row.avg_grade),
    rank_in_program: Number(row.rank_in_program),
    row_number_in_program: Number(row.row_number_in_program),
    percentile: Number(row.percentile),
    total_students_in_program: Number(row.total_students_in_program),
  }));

  // 4. KPIs
  const topStudent = data.length > 0 ? data[0] : null;
  const avgGPATop10 = data.length > 0
    ? (data.slice(0, Math.min(10, data.length))
        .reduce((sum, s) => sum + s.avg_grade, 0) / Math.min(10, data.length)).toFixed(2)
    : 0;
  const excellentCount = data.filter(s => s.gpa_category === 'Excelente').length;

  return {
    data,
    pagination: {
      total,
      totalPages,
      page,
      limit
    },
    kpis: {
      topStudent,
      avgGPATop10,
      excellentCount
    }
  };
}