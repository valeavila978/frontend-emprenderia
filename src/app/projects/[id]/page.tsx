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
  const [bmc, setBmc] = useState<any>(null) // Para guardar el resultado de la IA
  const [loading, setLoading] = useState(true)
  const [loadingIA, setLoadingIA] = useState(false)
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

  const handleGenerateIA = async () => {
    if (!token) return
    setLoadingIA(true)
    setError('')
    try {
      const data = await ProjectService.generateBmc(projectId, token)
      setBmc(data.bmc) // Guardamos el objeto bmc de la respuesta
    } catch (err) {
      setError('No se pudo generar el BMC. Verifica que el microservicio de IA esté activo.')
    } finally {
      setLoadingIA(false)
    }
  }

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

  if (error && !bmc) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a Proyectos
          </Link>
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Volver a Proyectos
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{project?.title}</h1>
            <button 
              onClick={handleGenerateIA}
              disabled={loadingIA}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                loadingIA ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
              } text-white shadow-lg`}
            >
              {loadingIA ? '⌛ Generando...' : '🧠 Analizar con IA (BMC)'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
             <p className="text-gray-600 text-sm mb-2 font-bold uppercase tracking-wider">Descripción del Proyecto</p>
             <p className="text-gray-700 text-lg leading-relaxed">{project?.description}</p>
          </div>

          {/* --- VISTA DEL CANVAS DE IA --- */}
          {bmc && (
            <div className="mt-10 animate-in fade-in duration-700">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                📊 Business Model Canvas (IA Generated)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-gray-200 p-2 rounded-lg border-2 border-purple-200">
                
                {/* Columna 1 */}
                <CanvasBlock title="Aliados Clave" items={bmc.key_partners} color="bg-white" className="md:row-span-2" />
                
                {/* Columna 2 */}
                <div className="md:col-span-1 grid grid-rows-2 gap-2">
                  <CanvasBlock title="Actividades Clave" items={bmc.key_activities} color="bg-white" />
                  <CanvasBlock title="Recursos Clave" items={bmc.key_resources} color="bg-white" />
                </div>

                {/* Columna 3 */}
                <CanvasBlock title="Propuesta de Valor" items={bmc.value_proposition} color="bg-purple-50" className="md:row-span-2" />

                {/* Columna 4 */}
                <div className="md:col-span-1 grid grid-rows-2 gap-2">
                  <CanvasBlock title="Relación con Clientes" items={bmc.customer_relationships} color="bg-white" />
                  <CanvasBlock title="Canales" items={bmc.channels} color="bg-white" />
                </div>

                {/* Columna 5 */}
                <CanvasBlock title="Segmentos de Clientes" items={bmc.customer_segments} color="bg-white" className="md:row-span-2" />

                {/* Fila inferior */}
                <CanvasBlock title="Estructura de Costos" items={bmc.cost_structure} color="bg-white" className="md:col-span-2" />
                <div className="hidden md:block bg-transparent"></div>
                <CanvasBlock title="Fuentes de Ingresos" items={bmc.revenue_streams} color="bg-white" className="md:col-span-2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para los bloques del Canvas
function CanvasBlock({ title, items, color, className = "" }: any) {
  return (
    <div className={`${color} p-4 border border-gray-300 rounded shadow-sm ${className}`}>
      <h3 className="font-bold text-xs text-purple-800 uppercase mb-3 border-b pb-1">{title}</h3>
      <ul className="space-y-2">
        {items?.map((item: string, index: number) => (
          <li key={index} className="text-[11px] leading-tight text-gray-700 flex gap-1">
            <span className="text-purple-400">•</span> {item}
          </li>
        ))}
      </ul>
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