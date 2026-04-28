'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, validate2FA } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (show2FA && tempToken) {
        await validate2FA(tempToken, code)
        router.push('/dashboard')
      } else {
        const result = await login(email, password)
        if (result.requires2FA && result.tempToken) {
          setTempToken(result.tempToken)
          setShow2FA(true)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el inicio de sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚀 EmprendeIA</h1>
          <p className="text-gray-600 mt-2">
            {show2FA ? 'Verificación de Seguridad' : 'Iniciar Sesión'}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!show2FA ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Ingresa el código de 6 dígitos de tu aplicación de autenticación.
              </p>
              <Input
                label="Código 2FA"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShow2FA(false)}
                className="text-xs text-blue-600 hover:underline w-full text-center"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            {show2FA ? 'Verificar Código' : 'Iniciar Sesión'}
          </Button>
        </form>

        {!show2FA && (
          <p className="text-center text-gray-600 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
