import { API_URL } from '@/config'

export interface ResourceItem {
  id: string
  title: string
  description: string
  url?: string
  tags?: string[]
}

export const ResourcesService = {
  getResources: async (stage: string | null, token: string): Promise<ResourceItem[]> => {
    const url = new URL(`${API_URL}/resources`)
    if (stage) url.searchParams.append('stage', stage)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Error al obtener recursos')
    return res.json()
  }
}
