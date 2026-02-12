import { query } from '@/lib/db';
import { AttendanceByGroup } from '@/types/reports';

export async function getAttendanceReport(term?: string) {
  let sqlQuery = `SELECT * FROM vw_attendance_by_group`;
  const params: any[] = [];

  if (term) {
    sqlQuery += ` WHERE term = $1`;
    params.push(term);
  }

  sqlQuery += ` ORDER BY avg_attendance_rate ASC`;

  const raw = await query<AttendanceByGroup>(sqlQuery, params);


  const data = raw.map(row => ({
    ...row,
    avg_attendance_rate: Number(row.avg_attendance_rate),
    total_students: Number(row.total_students),
    total_classes: Number(row.total_classes),
    students_good_attendance: Number(row.students_good_attendance),
    students_poor_attendance: Number(row.students_poor_attendance),
  }));


  const avgAttendanceGlobal = data.length > 0
    ? (data.reduce((sum, row) => sum + row.avg_attendance_rate, 0) / data.length).toFixed(2)
    : 0;
  
  const kpis = {
    totalGroups: data.length,
    avgAttendanceGlobal,
    excellentGroups: data.filter(g => g.attendance_category === 'EXCELLENT').length,
    poorGroups: data.filter(g => g.attendance_category === 'POOR').length,
  };

  return { data, kpis };
}