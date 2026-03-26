import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ApiError,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('Falló el inicio de sesión')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Falló el registro')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async getMe(token: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('No autorizado')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('No se pudo renovar el token')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }
}
