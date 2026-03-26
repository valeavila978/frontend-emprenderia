'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AuthContextType, User } from '@/types'
import { AuthService } from '@/services/authService'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar token y usuario del localStorage en el montaje
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      // Intentar obtener los datos del usuario
      AuthService.getMe(savedToken)
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          // Token inválido, limpiar
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await AuthService.login({ email, password })
      const newToken = response.token

      setToken(newToken)
      localStorage.setItem('token', newToken)

      // Obtener datos del usuario
      const userData = await AuthService.getMe(newToken)
      setUser(userData)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en login')
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, role: string) => {
    try {
      setLoading(true)
      await AuthService.register({ email, password, role })
      // Hacer login automático después del registro
      await login(email, password)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en registro')
    } finally {
      setLoading(false)
    }
  }, [login])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!token,
    token,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
