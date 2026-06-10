import { API_URL } from '@/config'

export interface Milestone {
  id: string
  projectId: string
  title: string
  isCompleted: boolean
  dueDate?: string | null
}

export const MilestoneService = {
  getMilestones: async (projectId: string, token: string): Promise<Milestone[]> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al obtener hitos')
    return res.json()
  },

  createMilestone: async (projectId: string, title: string, dueDate: string | null, token: string): Promise<Milestone> => {
    const payload = {
      title,
      description: title,
      dueDate: dueDate ?? new Date().toISOString()
    }
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Error al crear hito')
    return res.json()
  },

  toggleMilestone: async (projectId: string, milestoneId: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/projects/${projectId}/milestones/${milestoneId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al actualizar hito')
  }
}
