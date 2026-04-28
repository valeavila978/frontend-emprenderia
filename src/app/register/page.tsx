'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('Entrepreneur')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await register(name, email, password, role)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚀 EmprendeIA</h1>
          <p className="text-gray-600 mt-2">Crear Nueva Cuenta</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Entrepreneur">👨‍💼 Emprendedor</option>
              <option value="Investor">💰 Inversor</option>
              <option value="Mentor">🎓 Mentor</option>
            </select>
          </div>

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Registrarse
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-green-600 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
