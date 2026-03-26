import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'EmprendeIA - Plataforma para Emprendedores',
  description: 'Plataforma integral para emprendedores, inversores y mentores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
