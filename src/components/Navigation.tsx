'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🚀 EmprendeIA
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  Bienvenido, <strong>{user?.email}</strong>
                </span>
                <span className="bg-green-500 px-2 py-1 rounded text-xs">
                  {user?.role}
                </span>
              </div>

              <Link href="/dashboard" className="hover:bg-blue-700 px-4 py-2 rounded">
                Dashboard
              </Link>

              <Link href="/projects" className="hover:bg-blue-700 px-4 py-2 rounded">
                Proyectos
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:bg-blue-700 px-4 py-2 rounded">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
