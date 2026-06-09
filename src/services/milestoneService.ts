import { API_URL } from '@/config'

export interface Milestone {
  id: string
  projectId: string
  title: string
  isCompleted: boolean
  targetDate?: string | null
}

export const MilestoneService = {
  getMilestones: async (projectId: string, token: string): Promise<Milestone[]> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al obtener hitos')
    return res.json()
  },

  createMilestone: async (projectId: string, title: string, targetDate: string | null, token: string): Promise<Milestone> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, targetDate })
    })
    if (!res.ok) throw new Error('Error al crear hito')
    return res.json()
  },

  toggleMilestone: async (projectId: string, milestoneId: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al actualizar hito')
  }
}
