'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">🚀 EmprendeIA</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            La plataforma integral para emprendedores, inversores y mentores
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Conecta tu idea innovadora con los recursos y personas que necesitas para hacerla realidad
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Empezar Ahora
            </Link>
            <Link
              href="/login"
              className="inline-block bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors border-2 border-white"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Características Principales</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-blue-600">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">👨‍💼 Para Emprendedores</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Comparte tus ideas innovadoras</li>
                <li>✓ Presenta proyectos a inversores</li>
                <li>✓ Conecta con mentores experimentados</li>
                <li>✓ Obtén retroalimentación valioso</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-green-600">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">💰 Para Inversores</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Descubre proyectos innovadores</li>
                <li>✓ Evalúa oportunidades de inversión</li>
                <li>✓ Conecta con emprendedores</li>
                <li>✓ Diversifica tu portafolio</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-purple-600">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🎓 Para Mentores</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✓ Comparte tu experiencia</li>
                <li>✓ Apoya el crecimiento de startups</li>
                <li>✓ Construye tu red profesional</li>
                <li>✓ Genera impacto positivo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de emprendedores, inversores y mentores que ya están transformando ideas en realidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Registrarse Ahora
            </Link>
            <Link
              href="/login"
              className="inline-block bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors border-2 border-white"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">&copy; 2026 EmprendeIA. Todos los derechos reservados.</p>
          <p className="text-gray-400">Conectando ideas con oportunidades</p>
        </div>
      </footer>
    </main>
  )
}
