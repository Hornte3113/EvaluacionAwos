import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
// Importamos iconos para el menú
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClipboardDocumentCheckIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema Académico AWOS',
  description: 'Panel de control de reportes académicos',
}

// Definimos los enlaces del sidebar
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Rendimiento Cursos', href: '/reports/course-performance', icon: ChartBarIcon },
  { name: 'Carga Docente', href: '/reports/teacher-load', icon: UserGroupIcon },
  { name: 'Estudiantes en Riesgo', href: '/reports/students-at-risk', icon: ExclamationTriangleIcon },
  { name: 'Asistencia Grupal', href: '/reports/attendance', icon: ClipboardDocumentCheckIcon },
  { name: 'Ranking Académico', href: '/reports/ranking', icon: TrophyIcon },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full bg-gray-100">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full flex">
          
          {/* --- SIDEBAR OSCURO --- */}
          <aside className="w-64 flex-shrink-0 bg-emerald-800 hidden md:flex md:flex-col">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                 {/* Título del sistema */}
                <h1 className="text-white text-xl font-bold tracking-wider">Dashboard escolar</h1>
              </div>
              <nav className="mt-5 flex-1 flex flex-col divide-y divide-emerald-700
 overflow-y-auto px-2">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-emerald-50 hover:bg-emerald-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"

                    >
                      <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-emerald-200" aria-hidden="true" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
  
          </aside>

          {/* --- CONTENIDO PRINCIPAL --- */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header superior simple */}
            <header className="bg-white shadow-sm z-10 p-4 md:hidden">
               <h1 className="text-xl font-bold text-gray-800">AWOS Sistema</h1>
            </header>
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
              {/* Aquí se renderizará page.tsx */}
              <div className="container mx-auto px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}