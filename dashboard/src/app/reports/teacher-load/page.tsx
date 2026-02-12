import { TermPaginationSchema } from '@/lib/validations';
import Link from 'next/link';
import { getTeacherLoadReport } from '@/services/teacherLoadService';

export default async function TeachersReport({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; page?: string; limit?: string }>;
}) {
  const validated = TermPaginationSchema.safeParse(await searchParams);

  if (!validated.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Validación</h1>
        <pre className="text-sm">{JSON.stringify(validated.error.issues, null, 2)}</pre>
      </div>
    );
  }

  const { term, page, limit } = validated.data;

  const { data, pagination, kpis } = await getTeacherLoadReport(term, page, limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carga Docente</h1>
        <p className="text-gray-600 mt-1">
          Distribución de estudiantes y grupos por docente
          {term && ` - Término: ${term}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Término
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
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
          >
            Aplicar
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Docentes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalTeachers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Grupos</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{kpis.totalGroups}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Estudiantes Totales</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{kpis.totalStudentsManaged}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Promedio por Docente</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{kpis.avgStudentsPerTeacher}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Término
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grupos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Promedio General
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cursos Impartidos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay datos disponibles.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={`${row.teacher_id}-${row.term}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{row.teacher_name}</div>
                      <div className="text-gray-500 text-xs">{row.teacher_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.term}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_groups}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${
                        row.overall_avg_grade >= 80 ? 'text-green-600' :
                        row.overall_avg_grade >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {row.overall_avg_grade ? row.overall_avg_grade.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.courses_taught}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages} • Total: {pagination.total} docentes
            </div>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`?term=${term || ''}&page=${pagination.page - 1}&limit=${limit}`}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 text-sm"
                >
                  Anterior
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`?term=${term || ''}&page=${pagination.page + 1}&limit=${limit}`}
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