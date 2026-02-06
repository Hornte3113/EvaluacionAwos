import { query } from '@/lib/db';
import { CoursePerformance } from '@/types/reports';
import { TermFilterSchema } from '@/lib/validations';

export default async function PerformanceReport({
  searchParams,
}: {
  searchParams: Promise<{ term?: string; program?: string }>;
}) {
  // Validar parámetros con Zod
  const validated = TermFilterSchema.safeParse(await searchParams);

  if (!validated.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Validación</h1>
        <p className="text-gray-700">Por favor selecciona un término válido.</p>
      </div>
    );
  }

  const { term, program } = validated.data;

  // Construcción de query parametrizada
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

  // Ejecutar query
  const raw = await query<CoursePerformance>(sqlQuery, params);

  // pg devuelve campos numeric como string, convertimos a number
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

  // Calcular KPIs
  const totalStudents = data.reduce((sum, row) => sum + row.total_students, 0);
  const avgPassRate = data.length > 0
    ? (data.reduce((sum, row) => sum + row.pass_rate, 0) / data.length).toFixed(2)
    : 0;
  const totalFailed = data.reduce((sum, row) => sum + row.failed_students, 0);
  const excellentStudents = data.reduce((sum, row) => sum + row.excellent_students, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rendimiento de Cursos</h1>
          <p className="text-gray-600 mt-1">
            Análisis de aprobación y desempeño por materia - Término: {term}
            {program && ` | Programa: ${program}`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form method="GET" className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Término *
            </label>
            <select
              name="term"
              defaultValue={term}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un término</option>
              <option value="2024-1">2024-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2025-1">2025-1</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programa (opcional)
            </label>
            <select
              name="program"
              defaultValue={program || ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los programas</option>
              <option value="ISC">ISC</option>
              <option value="II">II</option>
              <option value="IM">IM</option>
              <option value="IGE">IGE</option>
              <option value="LA">LA</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Total Estudiantes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Tasa de Aprobación Promedio</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{avgPassRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Estudiantes Reprobados</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{totalFailed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 font-medium">Excelencia (≥90)</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{excellentStudents}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aprobados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron resultados para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={`${row.course_id}-${row.program}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.course_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.course_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.avg_grade.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {row.passed_students} / {row.total_students}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.pass_rate >= 80
                            ? 'bg-green-100 text-green-800'
                            : row.pass_rate >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.pass_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}