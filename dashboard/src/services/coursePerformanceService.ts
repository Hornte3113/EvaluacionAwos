import { query } from '@/lib/db';
import { CoursePerformance } from '@/types/reports';

export async function getCoursePerformanceReport(term: string, program?: string) {
  let sqlQuery = `
    SELECT * FROM vw_course_performance
    WHERE term = $1
  `;
  const params: any[] = [term];

  if (program) {
    sqlQuery += ` AND program = $2`;
    params.push(program);
  }

  sqlQuery += ` ORDER BY pass_rate DESC`;

  const raw = await query<CoursePerformance>(sqlQuery, params);


  const data = raw.map(row => ({
    ...row,
    total_students: Number(row.total_students),
    avg_grade: Number(row.avg_grade),
    passed_students: Number(row.passed_students),
    failed_students: Number(row.failed_students),
    pass_rate: Number(row.pass_rate),
    excellent_students: Number(row.excellent_students),
    min_grade: Number(row.min_grade),
    max_grade: Number(row.max_grade),
    credits: Number(row.credits),
  }));

  // 4. Calcular KPIs
  const kpis = {
    totalStudents: data.reduce((sum, row) => sum + row.total_students, 0),
    avgPassRate: data.length > 0
      ? (data.reduce((sum, row) => sum + row.pass_rate, 0) / data.length).toFixed(2)
      : 0,
    totalFailed: data.reduce((sum, row) => sum + row.failed_students, 0),
    excellentStudents: data.reduce((sum, row) => sum + row.excellent_students, 0),
  };

  return { data, kpis };
}