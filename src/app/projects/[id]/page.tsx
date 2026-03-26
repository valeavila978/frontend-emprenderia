'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { Alert } from '@/components/Alert'
import Link from 'next/link'
import { Project } from '@/types'

function ProjectDetailContent() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!token) return
        const data = await ProjectService.getProjectById(projectId, token)
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el proyecto')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [token, projectId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a Proyectos
          </Link>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {!project && !error && (
            <Alert type="error" message="No se encontró el proyecto" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Botón Volver */}
        <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Volver a Proyectos
        </Link>

        {/* Contenido del Proyecto */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{project.title}</h1>

          {/* Información Meta */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">ID del Proyecto</p>
                <p className="text-lg font-medium text-gray-800 truncate">{project.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Owner ID</p>
                <p className="text-lg font-medium text-gray-800 truncate">{project.ownerId}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fecha de Creación</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              💬 Contactar
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              ⭐ Seguir
            </button>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              📤 Compartir
            </button>
          </div>
        </div>

        {/* Sección de Próximas Características */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🚀 Próximas Características</h2>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Comentarios y retroalimentación</li>
            <li>✓ Sistema de seguimiento</li>
            <li>✓ Compartir en redes sociales</li>
            <li>✓ Solicitud de inversión</li>
            <li>✓ Búsqueda de mentores</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  )
}
