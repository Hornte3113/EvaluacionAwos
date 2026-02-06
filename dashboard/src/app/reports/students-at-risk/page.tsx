import { query } from '@/lib/db';
import { StudentAtRisk } from '@/types/reports';
import { SearchSchema } from '@/lib/validations';
import Link from 'next/link';

export default async function RiskReport({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
  // Validar parámetros
  const validated = SearchSchema.safeParse(await searchParams);

  if (!validated.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Validación</h1>
        <pre className="text-sm">{JSON.stringify(validated.error.issues, null, 2)}</pre>
      </div>
    );
  }

  const { search, page, limit } = validated.data;
  const offset = (page - 1) * limit;

  // Query para contar total
  let countQuery = `SELECT COUNT(*) as total FROM vw_students_at_risk`;
  const countParams: any[] = [];

  if (search) {
    countQuery += ` WHERE LOWER(student_name) LIKE LOWER($1) OR LOWER(student_email) LIKE LOWER($1)`;
    countParams.push(`%${search}%`);
  }

  const countResult = await query<{ total: string }>(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  // Query principal
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

  // pg devuelve campos numeric como string, convertimos a number
  const data = raw.map(row => ({
    ...row,
    avg_grade: Number(row.avg_grade),
    attendance_rate: Number(row.attendance_rate),
    total_absences: Number(row.total_absences),
    courses_failed: Number(row.courses_failed),
    total_enrollments: Number(row.total_enrollments),
  }));

  // KPIs
  const criticalCount = data.filter(s => s.risk_level === 'CRITICAL').length;
  const highCount = data.filter(s => s.risk_level === 'HIGH').length;
  const avgGradeAtRisk = data.length > 0
    ? (data.reduce((sum, s) => sum + s.avg_grade, 0) / data.length).toFixed(2)
    : 0;
  const avgAttendance = data.length > 0
    ? (data.reduce((sum, s) => sum + s.attendance_rate, 0) / data.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes en Riesgo</h1>
        <p className="text-gray-600 mt-1">
          Identificación de alumnos con bajo rendimiento académico o asistencia deficiente
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre o correo
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search || ''}
              placeholder="Ejemplo: Juan Pérez o juan@email.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              name="limit"
              defaultValue={limit}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium"
          >
            Buscar
          </button>
          {search && (
            <Link
              href="/reports/students-at-risk"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total en Riesgo</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Riesgo Crítico</p>
          <p className="text-3xl font-bold text-red-800 mt-2">{criticalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Promedio Calificaciones</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{avgGradeAtRisk}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Asistencia Promedio</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{avgAttendance}%</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asistencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reprobados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nivel Riesgo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Factores
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {search
                      ? `No se encontraron resultados para "${search}"`
                      : 'No hay estudiantes en riesgo'}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{row.student_name}</div>
                      <div className="text-gray-500 text-xs">{row.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${
                        row.avg_grade >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {row.avg_grade.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${
                        row.attendance_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {row.attendance_rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.courses_failed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.risk_level === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : row.risk_level === 'HIGH'
                            ? 'bg-orange-100 text-orange-800'
                            : row.risk_level === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {row.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.risk_factors}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Página {page} de {totalPages} • Total: {total} estudiantes
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?search=${search || ''}&page=${page - 1}&limit=${limit}`}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?search=${search || ''}&page=${page + 1}&limit=${limit}`}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}