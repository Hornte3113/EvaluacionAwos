import Link from 'next/link';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline'

export default function DashboardHome() {
  // Definimos la data de las tarjetas de resumen
  const summaryCards = [
    { 
      title: "Rendimiento de Cursos", 
      href: "/reports/course-performance",
      description: "Análisis de tasas de aprobación y promedios generales por materia y periodo.", 
      icon: ChartBarIcon,
      color: "bg-blue-500"
    },
    { 
      title: "Carga Docente", 
      href: "/reports/teachers", 
      description: "Total de estudiantes y grupos asignados a cada profesor activo.", 
      icon: UserGroupIcon,
      color: "bg-green-500"
    },
    { 
      title: "Estudiantes en Riesgo", 
      href: "/reports/risk", 
      description: "Identificación de alumnos con alto riesgo de reprobación por notas o faltas.", 
      icon: ExclamationTriangleIcon,
      color: "bg-red-500"
    },
    { 
      title: "Asistencia por Grupo", 
      href: "/reports/attendance", 
      description: "Monitoreo de porcentajes de asistencia por grupo y materia.", 
      icon: ClipboardDocumentCheckIcon,
      color: "bg-purple-500"
    },
    { 
      title: "Ranking Académico", 
      href: "/reports/ranking", 
      description: "Listado de los mejores promedios por programa académico (Top 10).", 
      icon: TrophyIcon,
      color: "bg-yellow-500"
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Vista General</h1>
      
      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <div key={card.href} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-5 flex items-start">
              {/* Icono con fondo de color */}
              <div className={`flex-shrink-0 p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900 truncate">{card.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {card.description}
                </p>
              </div>
            </div>
            {/* Enlace en la parte inferior de la tarjeta */}
            <Link 
              href={card.href} 
              className="block bg-gray-50 px-5 py-3 text-sm font-medium text-indigo-600 hover:bg-gray-100 transition-colors border-t border-gray-100"
            >
              Ver reporte completo &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}