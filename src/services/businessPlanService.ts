import { API_URL } from '@/config'

export const BusinessPlanService = {
  getBusinessPlan: async (projectId: string, token: string): Promise<{ content: string }> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/business-plan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener el plan de negocios')
    }

    return await response.json()
  },

  generateBusinessPlan: async (projectId: string, token: string): Promise<{ content: string }> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/business-plan/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al generar el plan de negocios')
    }

    return await response.json()
  },

  updateBusinessPlan: async (projectId: string, content: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/business-plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error('Error al actualizar el plan de negocios')
    }
  },
}
