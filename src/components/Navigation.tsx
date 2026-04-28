'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Rocket, ShoppingBag, LogOut, User as UserIcon } from 'lucide-react'

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/projects', label: 'Proyectos', icon: <Rocket size={18} /> },
    { href: '/marketplace', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
    { href: '/profile', label: 'Mi Perfil', icon: <UserIcon size={18} /> },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/30">
            <Rocket className="text-white" size={20} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">EmprendeIA</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden lg:flex items-center gap-1 mr-4">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href)
                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  )
                })}
              </div>

              <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />

              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-black text-slate-900 leading-none mb-1">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">
                    {user?.role}
                  </span>
                </div>
                <div className="bg-slate-100 p-2 rounded-full text-slate-500 border border-slate-200">
                  <UserIcon size={18} />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-slate-600 hover:text-blue-600 font-bold text-sm px-4 py-2"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
