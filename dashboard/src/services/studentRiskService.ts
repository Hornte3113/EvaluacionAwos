import { query } from '@/lib/db';
import { StudentAtRisk } from '@/types/reports';

export async function getStudentRiskReport(
  search: string | undefined,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;

  let countQuery = `SELECT COUNT(*) as total FROM vw_students_at_risk`;
  const countParams: any[] = [];

  if (search) {
    countQuery += ` WHERE LOWER(student_name) LIKE LOWER($1) OR LOWER(student_email) LIKE LOWER($1)`;
    countParams.push(`%${search}%`);
  }

  const countResult = await query<{ total: string }>(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  let sqlQuery = `SELECT * FROM vw_students_at_risk`;
  const params: any[] = [];

  if (search) {
    sqlQuery += ` WHERE LOWER(student_name) LIKE LOWER($1) OR LOWER(student_email) LIKE LOWER($1)`;
    params.push(`%${search}%`);
  }

  sqlQuery += ` ORDER BY 
    CASE risk_level 
      WHEN 'CRITICAL' THEN 1 
      WHEN 'HIGH' THEN 2 
      WHEN 'MEDIUM' THEN 3 
      ELSE 4 
    END, 
    avg_grade ASC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  
  params.push(limit, offset);

  const raw = await query<StudentAtRisk>(sqlQuery, params);

  const data = raw.map(row => ({
    ...row,
    avg_grade: Number(row.avg_grade),
    attendance_rate: Number(row.attendance_rate),
    total_absences: Number(row.total_absences),
    courses_failed: Number(row.courses_failed),
    total_enrollments: Number(row.total_enrollments),
  }));

  const kpis = {
    criticalCount: data.filter(s => s.risk_level === 'CRITICAL').length,
    highCount: data.filter(s => s.risk_level === 'HIGH').length,
    avgGradeAtRisk: data.length > 0
      ? (data.reduce((sum, s) => sum + s.avg_grade, 0) / data.length).toFixed(2)
      : 0,
    avgAttendance: data.length > 0
      ? (data.reduce((sum, s) => sum + s.attendance_rate, 0) / data.length).toFixed(2)
      : 0
  };

  return {
    data,
    pagination: {
      total,
      totalPages,
      page,
      limit
    },
    kpis
  };
}