'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { FinancialService } from '@/services/financialService'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Project } from '@/types'
import { Users, Briefcase, Filter, X } from 'lucide-react'
import { motion } from 'framer-motion'

type TabType = 'projects' | 'entrepreneurs'

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token, user } = useAuth()
  const [analysisMap, setAnalysisMap] = useState<Record<string, any>>({})
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([])
  const [loadingEntrepreneurs, setLoadingEntrepreneurs] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [stageFilter, setStageFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const router = useRouter()

  const openProjectModal = (project: Project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }

  const closeProjectModal = () => {
    setSelectedProject(null)
    setShowProjectModal(false)
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setError('')
        if (!token) return
        const data = await ProjectService.getProjects(token)
        setProjects(data)
        
        // If viewer (mentor/investor), apply stage filter and fetch financials
        const isViewer = user?.role === 'Investor' || user?.role === 'Mentor'
        if (isViewer && data && data.length) {
          // Filter out 'Idea' stage projects
          const visibleProjects = data.filter((p: Project) => p.stage !== 'Idea' && p.stage !== 'Ideación')
          setFilteredProjects(visibleProjects)
          
          // Fetch financial data for visible projects
          const slice = visibleProjects.slice(0, 20)
          const promises = slice.map((p: Project) => FinancialService.getAnalysisByProjectId(p.id, token))
          const results = await Promise.all(promises)
          const map: Record<string, any> = {}
          slice.forEach((p: Project, idx: number) => {
            map[p.id] = results[idx]
          })
          setAnalysisMap(map)
        } else {
          setFilteredProjects(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar proyectos')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token, user?.role])

  // Load entrepreneurs if user is entrepreneur
  useEffect(() => {
    if (user?.role === 'Entrepreneur' && activeTab === 'entrepreneurs') {
      loadEntrepreneurs()
    }
  }, [activeTab, user?.role])

  const loadEntrepreneurs = async () => {
    if (!token) return
    setLoadingEntrepreneurs(true)
    try {
      // Get all projects to identify entrepreneurs with projects
      const allProjects = await ProjectService.getProjects(token)
      const entrepreneursMap = new Map()
      
      allProjects.forEach((proj: Project) => {
        if (proj.ownerId) {
          if (!entrepreneursMap.has(proj.ownerId)) {
            entrepreneursMap.set(proj.ownerId, {
              id: proj.ownerId,
              email: proj.ownerEmail || proj.ownerId,
              projectCount: 1,
              projects: [proj]
            })
          } else {
            const ent = entrepreneursMap.get(proj.ownerId)
            ent.projectCount += 1
            ent.projects.push(proj)
            entrepreneursMap.set(proj.ownerId, ent)
          }
        }
      })
      
      // Filter to show only entrepreneurs with at least 1 project
      setEntrepreneurs(Array.from(entrepreneursMap.values()).filter((e: any) => e.projectCount >= 1))
    } catch (err) {
      console.error('Error loading entrepreneurs:', err)
    } finally {
      setLoadingEntrepreneurs(false)
    }
  }

  const isViewer = user?.role === 'Investor' || user?.role === 'Mentor'
  const isEntrepreneur = user?.role === 'Entrepreneur'
  const displayProjects = stageFilter === 'All' ? filteredProjects : filteredProjects.filter(p => p.stage === stageFilter)

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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{isViewer ? '🔎 Explorar Startups' : '📊 Mis Proyectos'}</h1>
          {!isViewer && (
            <Link
              href="/projects/create"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold"
            >
              ➕ Nuevo Proyecto
            </Link>
          )}
          {isViewer && (
            <div className="inline-block text-sm text-slate-500 font-medium">Startups visibles para inversores/mentores</div>
          )}
        </div>

        {/* Tabs for Entrepreneurs */}
        {isEntrepreneur && (
          <div className="mb-8 flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Briefcase className="inline mr-2" size={18} />
              Mis Proyectos
            </button>
            <button
              onClick={() => setActiveTab('entrepreneurs')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'entrepreneurs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Otros Emprendedores
            </button>
          </div>
        )}

        {/* Alertas */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Tab: Projects */}
        {activeTab === 'projects' && (
          <>
            {/* Filter Bar - Only for viewers */}
            {isViewer && (
              <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Filter size={18} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-600">Filtrar por etapa:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="ml-auto px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="All">Todas las etapas</option>
                  <option value="Prototipo">Prototipo</option>
                  <option value="MVP">MVP</option>
                  <option value="Escalado">Escalado</option>
                  <option value="Tracción">Tracción</option>
                  <option value="Crecimiento">Crecimiento</option>
                  <option value="Validacion">Validación</option>
                </select>
              </div>
            )}

            {/* Lista de Proyectos */}
            {displayProjects.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {isViewer ? 'No se encontraron startups' : 'No tienes proyectos aún'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isViewer 
                    ? 'Parece que no hay startups visibles en esta etapa.'
                    : 'Crea tu primer proyecto y comparte tu idea con la comunidad'}
                </p>
                {!isViewer && (
                  <Link
                    href="/projects/create"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                  >
                    Crear Mi Primer Proyecto
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      if (isEntrepreneur && project.ownerId === user?.userId) {
                        router.push(`/projects/${project.id}`)
                      } else {
                        openProjectModal(project)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') openProjectModal(project)
                    }}
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-100 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{project.title}</h3>
                        <span className="text-xs uppercase font-bold text-blue-700 px-3 py-1 rounded-full bg-blue-100 whitespace-nowrap ml-2">
                          {project.stage}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{project.description}</p>
                      
                      {/* ADN Summary for viewers */}
                      {isViewer && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">ADN del Proyecto</div>
                          {project.what && (
                            <div className="text-xs text-slate-700">
                              <span className="font-bold text-slate-900">¿Qué?</span> {project.what.substring(0, 100)}...
                            </div>
                          )}
                          {project.how && (
                            <div className="text-xs text-slate-700">
                              <span className="font-bold text-slate-900">¿Cómo?</span> {project.how.substring(0, 100)}...
                            </div>
                          )}
                          {project.why && (
                            <div className="text-xs text-slate-700">
                              <span className="font-bold text-slate-900">¿Por qué?</span> {project.why.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="text-xs text-gray-500">
                          📅 {new Date(project.createdAt).toLocaleDateString()}
                          {analysisMap[project.id] && (
                            <span className="ml-2 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold inline-block">
                              ✓ Análisis
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isEntrepreneur && project.ownerId === user?.userId) {
                              router.push(`/projects/${project.id}`)
                            } else {
                              openProjectModal(project)
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                        >
                          Ver Resumen →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Other Entrepreneurs */}
        {activeTab === 'entrepreneurs' && isEntrepreneur && (
          <>
            {loadingEntrepreneurs ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Cargando emprendedores...</p>
                </div>
              </div>
            ) : entrepreneurs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">No hay otros emprendedores</h2>
                <p className="text-gray-600">Sé el primero en la comunidad con un proyecto publicado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entrepreneurs.map((ent) => (
                  <motion.div
                    key={ent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-100 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {ent.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{ent.email.split('@')[0]}</h4>
                        <p className="text-xs text-slate-500">{ent.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-xs font-bold text-blue-800">
                        {ent.projectCount} {ent.projectCount === 1 ? 'proyecto' : 'proyectos'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {ent.projects.map((proj: Project) => (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => openProjectModal(proj)}
                          className="block w-full text-left p-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors text-xs font-medium text-slate-700 hover:text-blue-600 truncate"
                        >
                          → {proj.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Resumen Premium</p>
                <h2 className="text-3xl font-bold text-slate-900">{selectedProject.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{selectedProject.stage}</p>
              </div>
              <button
                type="button"
                onClick={closeProjectModal}
                className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-700 hover:bg-slate-100"
                aria-label="Cerrar resumen"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Descripción general</h3>
                <p className="text-slate-700 leading-relaxed">{selectedProject.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">¿Qué?</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedProject.what || 'Información no disponible'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">¿Cómo?</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedProject.how || 'Información no disponible'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">¿Por qué?</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedProject.why || 'Información no disponible'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Contactar Emprendedor</p>
                  <p className="text-sm text-slate-600">{selectedProject.ownerEmail || 'Email de contacto no disponible'}</p>
                </div>
                {selectedProject.ownerEmail ? (
                  <a
                    href={`mailto:${encodeURIComponent(selectedProject.ownerEmail)}?subject=${encodeURIComponent(
                      `Interés en tu startup: ${selectedProject.title}`
                    )}&body=${encodeURIComponent(
                      `Hola,%0D%0A%0D%0AEstoy interesado(a) en conocer más sobre tu startup: ${selectedProject.title}. Por favor, indícame la mejor forma de continuar la conversación.%0D%0A%0D%0AGracias.`
                    )}`}
                    className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    Contactar Emprendedor
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center rounded-3xl bg-slate-300 px-6 py-3 text-sm font-bold text-slate-700"
                  >
                    Contacto no disponible
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
