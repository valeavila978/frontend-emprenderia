'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function DashboardContent() {
  const { user } = useAuth()

  const roleDescriptions = {
    Entrepreneur: {
      emoji: '👨‍💼',
      description: 'Crea y gestiona tus proyectos emprendedores',
    },
    Investor: {
      emoji: '💰',
      description: 'Descubre e invierte en proyectos',
    },
    Mentor: {
      emoji: '🎓',
      description: 'Guía y apoya a otros emprendedores',
    },
  }

  const currentRole = user?.role as keyof typeof roleDescriptions
  const roleInfo = roleDescriptions[currentRole] || roleDescriptions.Entrepreneur

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Bienvenida */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bienvenido, {user?.email} {roleInfo.emoji}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{roleInfo.description}</p>

          {/* Información del Perfil */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Perfil</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-lg font-medium text-gray-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tipo de Usuario</p>
                <p className="text-lg font-medium text-gray-800">{user?.role}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">ID de Usuario</p>
                <p className="text-lg font-medium text-gray-800 truncate">{user?.userId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Proyectos */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Mis Proyectos</h2>
            <p className="text-gray-600 mb-6">
              Gestiona todos tus proyectos en un solo lugar
            </p>
            <Link
              href="/projects"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Proyectos
            </Link>
          </div>

          {/* Crear Nuevo Proyecto */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ Nuevo Proyecto</h2>
            <p className="text-gray-600 mb-6">
              Crea un nuevo proyecto y comparte tu idea con inversores
            </p>
            <Link
              href="/projects/create"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Proyecto
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Estadísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Proyectos Activos</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Interacciones</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Mensajes</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </div>

        {/* Información Útil */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Próximas Funciones</h3>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Gestión completa de proyectos</li>
            <li>✓ Sistema de mensajería</li>
            <li>✓ Búsqueda de inversores y mentores</li>
            <li>✓ Análisis y reportes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
