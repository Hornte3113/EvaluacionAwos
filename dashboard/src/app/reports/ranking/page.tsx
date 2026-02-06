import { query } from '@/lib/db';
import { StudentRanking } from '@/types/reports';
import { ProgramFilterSchema, ALLOWED_PROGRAMS } from '@/lib/validations';
import Link from 'next/link';

export default async function RankingReport({
  searchParams,
}: {
  searchParams: Promise<{ program?: string; term?: string; page?: string; limit?: string }>;
}) {
  // Validar parámetros con whitelist de programas
  const validated = ProgramFilterSchema.safeParse(await searchParams);

  if (!validated.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Validación</h1>
        <p className="text-gray-700 mb-4">
          Debes seleccionar un programa válido de la lista permitida.
        </p>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            Programas permitidos:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {ALLOWED_PROGRAMS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const { program, term, page, limit } = validated.data;
  const offset = (page - 1) * limit;

  // Query para contar total
  let countQuery = `SELECT COUNT(*) as total FROM vw_rank_students WHERE program = $1`;
  const countParams: any[] = [program];

  if (term) {
    countQuery += ` AND term = $2`;
    countParams.push(term);
  }

  const countResult = await query<{ total: string }>(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  // Query principal
  let sqlQuery = `SELECT * FROM vw_rank_students WHERE program = $1`;
  const params: any[] = [program];

  if (term) {
    sqlQuery += ` AND term = $2`;
    params.push(term);
  }

  sqlQuery += ` ORDER BY rank_in_program ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const raw = await query<StudentRanking>(sqlQuery, params);

  // pg devuelve campos numeric como string, convertimos a number
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

  // KPIs
  const topStudent = data.length > 0 ? data[0] : null;
  const avgGPATop10 = data.length > 0
    ? (data.slice(0, Math.min(10, data.length))
        .reduce((sum, s) => sum + s.avg_grade, 0) / Math.min(10, data.length)).toFixed(2)
    : 0;
  const excellentCount = data.filter(s => s.gpa_category === 'Excelente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ranking Académico</h1>
        <p className="text-gray-600 mt-1">
          Clasificación de estudiantes por desempeño académico - Programa: {program}
          {term && ` | Término: ${term}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programa * (obligatorio)
            </label>
            <select
              name="program"
              defaultValue={program}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500"
              required
            >
              {ALLOWED_PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Término (opcional)
            </label>
            <select
              name="term"
              defaultValue={term || ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los términos</option>
              <option value="2024-1">2024-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2025-1">2025-1</option>
            </select>
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
            className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 font-medium"
          >
            Aplicar
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Estudiantes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Promedio Top 10</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{avgGPATop10}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Estudiantes Excelentes</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{excellentCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Mejor Promedio</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {topStudent ? topStudent.avg_grade.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Top 3 Destacados */}
      {data.length > 0 && page === 1 && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 3 Estudiantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.slice(0, 3).map((student, index) => (
              <div
                key={student.student_id}
                className={`bg-white p-4 rounded-lg shadow ${
                  index === 0 ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">
                    {index === 0 ? '1' : index === 1 ? '2' : '3'}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{student.student_name}</p>
                    <p className="text-xs text-gray-500">{student.student_email}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Promedio:</span>
                    <span className="font-bold text-green-600">
                      {student.avg_grade.toFixed(2)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Créditos:</span>
                    <span className="font-medium">{student.total_credits}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Percentil:</span>
                    <span className="font-medium text-blue-600">
                      Top {student.percentile.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Término
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cursos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Créditos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentil
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
                    No hay datos disponibles para este programa.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={`${row.student_id}-${row.term}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold text-gray-400">
                        #{row.rank_in_program}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{row.student_name}</div>
                      <div className="text-gray-500 text-xs">{row.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.term}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.courses_taken}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold text-green-600">
                        {row.avg_grade.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      Top {row.percentile.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.gpa_category === 'Excelente'
                            ? 'bg-purple-100 text-purple-800'
                            : row.gpa_category === 'Sobresaliente'
                            ? 'bg-green-100 text-green-800'
                            : row.gpa_category === 'Bueno'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {row.gpa_category}
                      </span>
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
                  href={`?program=${program}&term=${term || ''}&page=${page - 1}&limit=${limit}`}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?program=${program}&term=${term || ''}&page=${page + 1}&limit=${limit}`}
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