import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types'

import { API_URL } from '@/config'

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

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión')
      }

      return data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async validate2FA(tempToken: string, code: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/2fa/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken, code }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Código 2FA inválido')
      }

      return data
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

      const dataResp = await response.json()

      if (!response.ok) {
        throw new Error(dataResp.message || 'Falló el registro')
      }

      return dataResp
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

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error refrescando token')
      }
      return data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // 2FA Management
  static async setup2FA(token: string): Promise<{ secret: string; qrUri: string }> {
    const response = await fetch(`${API_URL}/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Error al configurar 2FA')
    return await response.json()
  }

  static async verifySetup2FA(token: string, code: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/auth/2fa/verify-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    })
    if (!response.ok) throw new Error('Código inválido')
    const data = await response.json()
    return data.success
  }

  static async disable2FA(token: string, password: string, code: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/auth/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password, code }),
    })
    if (!response.ok) throw new Error('No se pudo desactivar 2FA')
    const data = await response.json()
    return data.success
  }
}
