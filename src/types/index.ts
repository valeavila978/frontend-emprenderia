// Tipos de Autenticación
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: 'Entrepreneur' | 'Investor' | 'Mentor'
}

export interface RegisterResponse {
  userId: string
}

export interface User {
  userId: string
  email: string
  role: 'Entrepreneur' | 'Investor' | 'Mentor'
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

// Tipos de Proyectos
export interface Project {
  id: string
  ownerId: string
  title: string
  description: string
  createdAt: string
}

export interface CreateProjectRequest {
  ownerId: string
  title: string
  description: string
}

export interface CreateProjectResponse {
  projectId: string
}

// Errores
export interface ApiError {
  message: string
  statusCode: number
}
