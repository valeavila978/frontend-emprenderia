import { UserProfile, API_URL } from '@/types'
import { API_URL as BASE_API_URL } from '@/config'

export class ProfileService {
  static async getMyProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${BASE_API_URL}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener el perfil')
    }

    return await response.json()
  }

  static async getProfile(userId: string, token: string): Promise<UserProfile> {
    const response = await fetch(`${BASE_API_URL}/profile/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Perfil no encontrado')
    }

    return await response.json()
  }

  static async updateProfile(token: string, data: Partial<UserProfile>): Promise<void> {
    const response = await fetch(`${BASE_API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Error al actualizar el perfil')
    }
  }
}
