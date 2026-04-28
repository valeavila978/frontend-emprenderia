'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import Link from 'next/link'

function CreateProjectContent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('Idea')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim() || !description.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!user || !token) {
      setError('Error de autenticación')
      return
    }

    setLoading(true)

    try {
      await ProjectService.createProject(
        {
          ownerId: user.userId,
          title,
          description,
          stage,
        } as any,
        token
      )

      setSuccess('¡Proyecto creado exitosamente!')
      setTitle('')
      setDescription('')

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/projects')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Volver a Proyectos
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">✨ Crear Nuevo Proyecto</h1>
          <p className="text-gray-600 mt-2">Comparte tu idea innovadora con la comunidad</p>
        </div>

        {/* Alertas */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Título del Proyecto"
              type="text"
              placeholder="Mi Idea Innovadora"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                placeholder="Describe tu proyecto en detalle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Etapa del Proyecto</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Idea">💡 Idea</option>
                <option value="Prototipo">🛠️ Prototipo</option>
                <option value="MVP">🚀 MVP</option>
                <option value="Escalado">📈 Escalado</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                <strong>💡 Consejo:</strong> Escribe una descripción clara y detallada de tu
                proyecto. Incluye el problema que resuelve, tu solución y el impacto esperado.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                Crear Proyecto
              </Button>
              <Link href="/projects" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info Adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">¿Qué información debo proporcionar?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span><strong>Título descriptivo:</strong> Debe ser claro y atractivo</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span><strong>Descripción detallada:</strong> Explica el problema y tu solución</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span><strong>Objetivo claro:</strong> Define el impacto que esperas lograr</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function CreateProjectPage() {
  return (
    <ProtectedRoute>
      <CreateProjectContent />
    </ProtectedRoute>
  )
}
