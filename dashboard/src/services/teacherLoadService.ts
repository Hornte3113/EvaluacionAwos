import { query } from '@/lib/db';
import { TeacherLoad } from '@/types/reports';

export async function getTeacherLoadReport(
  term: string | undefined,
  page: number,
  limit: number
) {
  const offset = (page - 1) * limit;

  let countQuery = `SELECT COUNT(*) as total FROM vw_teacher_load`;
  const countParams: any[] = [];

  if (term) {
    countQuery += ` WHERE term = $1`;
    countParams.push(term);
  }

  const countResult = await query<{ total: string }>(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  let sqlQuery = `SELECT * FROM vw_teacher_load`;
  const params: any[] = [];

  if (term) {
    sqlQuery += ` WHERE term = $1`;
    params.push(term);
  }


  sqlQuery += ` ORDER BY total_students DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const raw = await query<TeacherLoad>(sqlQuery, params);


  const data = raw.map(row => ({
    ...row,
    total_groups: Number(row.total_groups),
    total_students: Number(row.total_students),
    avg_students_per_group: Number(row.avg_students_per_group),
    overall_avg_grade: Number(row.overall_avg_grade),
    students_passed: Number(row.students_passed),
    students_failed: Number(row.students_failed),
  }));

  // 4. Cálculo de KPIs
  const totalStudentsManaged = data.reduce((sum, row) => sum + row.total_students, 0);
  
  const kpis = {
    totalTeachers: total, 
    totalGroups: data.reduce((sum, row) => sum + row.total_groups, 0),
    totalStudentsManaged,
    avgStudentsPerTeacher: data.length > 0
      ? (totalStudentsManaged / data.length).toFixed(1)
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