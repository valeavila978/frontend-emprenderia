'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { FinancialService } from '@/services/financialService'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { Project } from '@/types'

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token, user } = useAuth()
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError('')
        if (!token) return
        const data = await ProjectService.getProjects(token)
        setProjects(data)
        // If viewer (mentor/investor) fetch basic financials map for listed projects
        const isViewer = user?.role === 'Investor' || user?.role === 'Mentor'
        if (isViewer && data && data.length) {
          const slice = data.slice(0, 20)
          const promises = slice.map((p: Project) => FinancialService.getAnalysisByProjectId(p.id, token))
          const results = await Promise.all(promises)
          const map: Record<string, any> = {}
          slice.forEach((p: Project, idx: number) => {
            map[p.id] = results[idx]
          })
          setAnalysisMap(map)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar proyectos')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token])

  const isViewer = user?.role === 'Investor' || user?.role === 'Mentor'

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{isViewer ? '🔎 Explorar Startups' : '📊 Mis Proyectos'}</h1>
          {!isViewer && (
            <Link
              href="/projects/create"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Nuevo Proyecto
            </Link>
          )}
          {isViewer && (
            <div className="inline-block text-sm text-slate-500">Explora startups públicas en la plataforma</div>
          )}
        </div>

        {/* Alertas */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Lista de Proyectos */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No tienes proyectos aún</h2>
            <p className="text-gray-600 mb-6">
              Crea tu primer proyecto y comparte tu idea con la comunidad
            </p>
            <Link
              href="/projects/create"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Mi Primer Proyecto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                  <span className="text-xs uppercase font-bold text-slate-500 px-3 py-1 rounded-full bg-slate-100">{project.stage}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
                    {analysisMap[project.id] ? (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">Análisis disponible</span>
                    ) : null}
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Ver Detalles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  )
}
