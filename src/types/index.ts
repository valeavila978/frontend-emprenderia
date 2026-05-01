// Tipos de Autenticación
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  requires2FA?: boolean
  tempToken?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'Entrepreneur' | 'Investor' | 'Mentor'
}

export interface RegisterResponse {
  userId: string
}

export interface UserProfile {
  userId: string
  name: string
  email: string
  role: string
  is2FAEnabled: boolean
  bio?: string
  skills: string[]
  interests: string[]
  experienceLevel: string
  industries: string[]
}

export interface User {
  userId: string
  name: string
  email: string
  role: 'Entrepreneur' | 'Investor' | 'Mentor'
  is2FAEnabled: boolean
  profile?: UserProfile
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ requires2FA: boolean; tempToken?: string }>
  validate2FA: (tempToken: string, code: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  setup2FA: () => Promise<{ secret: string; qrUri: string }>
  verifySetup2FA: (code: string) => Promise<boolean>
  disable2FA: (password: string, code: string) => Promise<boolean>
  refreshUser: () => Promise<void>
}

// Tipos de Proyectos
export interface Project {
  id: string
  ownerId: string
  title: string
  description: string
  stage: string
  status: string
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

// Tipos de BMC
export interface ProjectBmc {
  projectId: string
  customerSegments: string
  valueProposition: string
  channels: string
  customerRelationships: string
  revenueStreams: string
  keyResources: string
  keyActivities: string
  keyPartners: string
  costStructure: string
  updatedAt: string
}

// Errores
export interface ApiError {
  message: string
  statusCode: number
}

// Fase 5: Finanzas
export interface FinancialProjection {
  year: number
  revenue: number
  expenses: number
  profit: number
  cashFlow: number
}

export interface FinancialAnalysis {
  projectId: string
  revenueProjections: string
  costAnalysis: string
  breakEvenAnalysis: string
  fundingRequirements: string
  keyIndicators: string
  generatedAt: string
}

// Fase 6: Marketplace
export interface MarketplaceProduct {
  id: string
  projectId: string
  projectName: string
  ownerName: string
  name: string
  description: string
  price: number
  category: 'Servicio' | 'Consultoria' | 'Digital' | 'Otro'
  images: string[]
  visibility: boolean
  createdAt: string
}
// Fase 4: Chatbot / Asistente IA
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}
