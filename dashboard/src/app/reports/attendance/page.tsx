import { query } from '@/lib/db';
import { AttendanceByGroup } from '@/types/reports';

export default async function AttendanceReport({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const { term } = await searchParams;

  // Query con filtro opcional de término
  let sqlQuery = `SELECT * FROM vw_attendance_by_group`;
  const params: any[] = [];

  if (term) {
    sqlQuery += ` WHERE term = $1`;
    params.push(term);
  }

  sqlQuery += ` ORDER BY avg_attendance_rate ASC`;

  const raw = await query<AttendanceByGroup>(sqlQuery, params);

  // pg devuelve campos numeric como string, convertimos a number
  const data = raw.map(row => ({
    ...row,
    avg_attendance_rate: Number(row.avg_attendance_rate),
    total_students: Number(row.total_students),
    total_classes: Number(row.total_classes),
    students_good_attendance: Number(row.students_good_attendance),
    students_poor_attendance: Number(row.students_poor_attendance),
  }));

  // KPIs
  const avgAttendanceGlobal = data.length > 0
    ? (data.reduce((sum, row) => sum + row.avg_attendance_rate, 0) / data.length).toFixed(2)
    : 0;
  const excellentGroups = data.filter(g => g.attendance_category === 'EXCELLENT').length;
  const poorGroups = data.filter(g => g.attendance_category === 'POOR').length;
  const totalGroups = data.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asistencia por Grupo</h1>
        <p className="text-gray-600 mt-1">
          Monitoreo de tasas de asistencia por curso y docente
          {term && ` - Término: ${term}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Término
            </label>
            <select
              name="term"
              defaultValue={term || ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los términos</option>
              <option value="2024-1">2024-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2025-1">2025-1</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-medium"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Grupos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalGroups}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Asistencia Promedio</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{avgAttendanceGlobal}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Grupos Excelentes</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{excellentGroups}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Grupos Deficientes</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{poorGroups}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Término
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asistencia Prom.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Buena Asist.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay datos de asistencia disponibles.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.group_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{row.course_code}</div>
                      <div className="text-gray-500 text-xs">{row.course_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {row.teacher_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.term}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_classes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${
                        row.avg_attendance_rate >= 90 ? 'text-green-600' :
                        row.avg_attendance_rate >= 80 ? 'text-blue-600' :
                        row.avg_attendance_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {row.avg_attendance_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.students_good_attendance} / {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.attendance_category === 'EXCELLENT'
                            ? 'bg-green-100 text-green-800'
                            : row.attendance_category === 'GOOD'
                            ? 'bg-blue-100 text-blue-800'
                            : row.attendance_category === 'REGULAR'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.attendance_category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda de categorías */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Categorías de Asistencia:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Excelente: ≥90%</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span>Bueno: 80-89%</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <span>Regular: 70-79%</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span>Deficiente: &lt;70%</span>
          </div>
        </div>
      </div>
    </div>
  );
}