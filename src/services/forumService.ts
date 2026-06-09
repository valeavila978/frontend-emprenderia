import { API_URL } from '@/config'

export interface ForumTopic {
  id: string
  title: string
  content: string
  creatorId: string
  createdAt: string
}

export interface ForumReply {
  id: string
  topicId: string
  content: string
  creatorId: string
  createdAt: string
}

export const ForumService = {
  getTopics: async (token: string): Promise<ForumTopic[]> => {
    const res = await fetch(`${API_URL}/forum/topics`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Error al obtener topics')
    return res.json()
  },

  createTopic: async (title: string, content: string, token: string): Promise<ForumTopic> => {
    const res = await fetch(`${API_URL}/forum/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, content })
    })
    if (!res.ok) throw new Error('Error al crear topic')
    return res.json()
  },

  getReplies: async (topicId: string, token: string): Promise<ForumReply[]> => {
    const res = await fetch(`${API_URL}/forum/topics/${topicId}/replies`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Error al obtener respuestas')
    return res.json()
  },

  postReply: async (topicId: string, content: string, token: string): Promise<ForumReply> => {
    const res = await fetch(`${API_URL}/forum/topics/${topicId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error('Error al crear respuesta')
    return res.json()
  }
}
