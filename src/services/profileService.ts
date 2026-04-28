import { UserProfile } from '@/types'
import { API_URL } from '@/config'

export class ProfileService {
  static async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('No se pudo obtener el perfil')
    return await response.json()
  }

  static async updateProfile(token: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    })
    if (!response.ok) throw new Error('No se pudo actualizar el perfil')
    return await response.json()
  }
}
