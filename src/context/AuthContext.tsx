'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AuthContextType, User, LoginResponse } from '@/types'
import { AuthService } from '@/services/authService'

const buildUserFromResponse = (userData: any): User => ({
  ...userData,
  profile: userData.profile ?? {
    userId: userData.userId ?? '',
    name: userData.name ?? '',
    email: userData.email ?? '',
    role: userData.role,
    is2FAEnabled: userData.is2FAEnabled ?? false,
    skills: [],
    interests: [],
    experienceLevel: '',
    industries: [],
  },
})

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }, [])

  // Cargar token y usuario del localStorage en el montaje
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedRefreshToken = localStorage.getItem('refreshToken')
      
      if (savedToken) {
        setToken(savedToken)
        try {
          const userData = await AuthService.getMe(savedToken)
          // Mapear respuesta plana del backend a estructura anidada esperada
          const transformedUser: User = buildUserFromResponse(userData)
          setUser(transformedUser)
        } catch (error) {
          console.warn('Token expirado, intentando refrescar...')
          if (savedRefreshToken) {
            try {
              const refreshResponse = await AuthService.refreshToken(savedRefreshToken)
              const newToken = refreshResponse.accessToken
              
              setToken(newToken)
              localStorage.setItem('token', newToken)
              if (refreshResponse.refreshToken) {
                localStorage.setItem('refreshToken', refreshResponse.refreshToken)
              }
              
              const userData = await AuthService.getMe(newToken)
              const transformedUser: User = buildUserFromResponse(userData)
              setUser(transformedUser)
            } catch (refreshError) {
              console.error('Fallo el refresh token', refreshError)
              logout()
            }
          } else {
            logout()
          }
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await AuthService.login({ email, password })
      
      if (response.requires2FA) {
        return { requires2FA: true, tempToken: response.tempToken }
      }

      const newToken = response.accessToken
      const newRefreshToken = response.refreshToken

      setToken(newToken)
      localStorage.setItem('token', newToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      const userData = await AuthService.getMe(newToken)
      const transformedUser: User = buildUserFromResponse(userData)
      setUser(transformedUser)
      
      return { requires2FA: false }
    } catch (error) {
      logout()
      throw new Error(error instanceof Error ? error.message : 'Error en login')
    } finally {
      setLoading(false)
    }
  }, [logout])

  const validate2FA = useCallback(async (tempToken: string, code: string) => {
    try {
      setLoading(true)
      const response = await AuthService.validate2FA(tempToken, code)
      
      const newToken = response.accessToken
      const newRefreshToken = response.refreshToken

      setToken(newToken)
      localStorage.setItem('token', newToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      const userData = await AuthService.getMe(newToken)
      const transformedUser: User = buildUserFromResponse(userData)
      setUser(transformedUser)
    } catch (error) {
      logout()
      throw new Error(error instanceof Error ? error.message : 'Error en validación 2FA')
    } finally {
      setLoading(false)
    }
  }, [logout])

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    try {
      setLoading(true)
      await AuthService.register({ name, email, password, role: role as any })
      await login(email, password)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en registro')
    } finally {
      setLoading(false)
    }
  }, [login])

  const setup2FA = useCallback(async () => {
    if (!token) throw new Error('No autenticado')
    return await AuthService.setup2FA(token)
  }, [token])

  const verifySetup2FA = useCallback(async (code: string) => {
    if (!token) throw new Error('No autenticado')
    const success = await AuthService.verifySetup2FA(token, code)
    if (success) {
      // Recargar datos de usuario para reflejar que 2FA está habilitado
      const userData = await AuthService.getMe(token)
      const transformedUser: User = buildUserFromResponse(userData)
      setUser(transformedUser)
    }
    return success
  }, [token])

  const disable2FA = useCallback(async (password: string, code: string) => {
    if (!token) throw new Error('No autenticado')
    const success = await AuthService.disable2FA(token, password, code)
    if (success) {
      const userData = await AuthService.getMe(token)
      const transformedUser: User = buildUserFromResponse(userData)
      setUser(transformedUser)
    }
    return success
  }, [token])

  const refreshUser = useCallback(async () => {
    if (token) {
      const userData = await AuthService.getMe(token)
      const transformedUser: User = buildUserFromResponse(userData)
      setUser(transformedUser)
    }
  }, [token])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!token,
    token,
    loading,
    login,
    validate2FA,
    register,
    logout,
    setup2FA,
    verifySetup2FA,
    disable2FA,
    refreshUser,
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
