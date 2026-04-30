'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProfileService } from '@/services/profileService'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'
import { Shield, User as UserIcon, Briefcase, Award, Settings as SettingsIcon, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ProfileContent() {
  const { user, token, setup2FA, verifySetup2FA, disable2FA, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: '',
    interests: '',
    experienceLevel: '',
    industries: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Sincronizar datos del perfil cuando el usuario cargue
  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        bio: user.profile.bio || '',
        skills: user.profile.skills?.join(', ') || '',
        interests: user.profile.interests?.join(', ') || '',
        experienceLevel: user.profile.experienceLevel || '',
        industries: user.profile.industries?.join(', ') || ''
      })
      // If the user has a profile with some data, show read-only view initially
      if (user.profile.bio || (user.profile.skills && user.profile.skills.length > 0)) {
        setIsEditing(false)
      } else {
        setIsEditing(true)
      }
    } else {
      setIsEditing(true)
    }
  }, [user])

  // 2FA State
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCode, setQrCode] = useState<{ secret: string, qrUri: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [show2FADisable, setShow2FADisable] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const formattedData = {
        ...profileData,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s),
        interests: profileData.interests.split(',').map(s => s.trim()).filter(s => s),
        industries: profileData.industries.split(',').map(s => s.trim()).filter(s => s)
      }
      await ProfileService.updateProfile(token, formattedData)
      await refreshUser()
      setSuccess('Perfil actualizado correctamente')
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleStart2FASetup = async () => {
    try {
      const data = await setup2FA()
      setQrCode(data)
      setShow2FASetup(true)
    } catch (err) {
      setError('Error al iniciar configuración de 2FA')
    }
  }

  const handleVerify2FA = async () => {
    try {
      const ok = await verifySetup2FA(verificationCode)
      if (ok) {
        setSuccess('2FA habilitado correctamente')
        setShow2FASetup(false)
        setQrCode(null)
      } else {
        setError('Código inválido')
      }
    } catch (err) {
      setError('Error en la verificación')
    }
  }

  const handleDisable2FA = async () => {
    try {
      const ok = await disable2FA(disablePassword, disableCode)
      if (ok) {
        setSuccess('2FA desactivado correctamente')
        setShow2FADisable(false)
      } else {
        setError('Contraseña o código inválido')
      }
    } catch (err) {
      setError('Error al desactivar 2FA')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
            <p className="text-slate-500 font-medium">Gestiona tu información personal y seguridad</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-xl">
               <UserIcon className="text-white" size={20} />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sesión iniciada como</p>
               <p className="text-sm font-black text-slate-900 leading-none">{user?.email}</p>
             </div>
          </div>
        </header>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <Alert type="success" message={success} onClose={() => setSuccess('')} />
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-6">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Información Profesional</h2>
                    <p className="text-sm font-medium text-slate-400">Detalles sobre tu carrera y habilidades</p>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Editar Perfil
                  </Button>
                )}
              </div>
              
              {!isEditing ? (
                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Biografía</label>
                    <p className="text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                      {profileData.bio || 'Sin biografía'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Habilidades</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills ? profileData.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-100">
                            {skill.trim()}
                          </span>
                        )) : <span className="text-slate-500 italic text-sm">No especificadas</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nivel de Experiencia</label>
                      <p className="text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {profileData.experienceLevel || 'No especificado'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Intereses</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.interests ? profileData.interests.split(',').map((interest, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-sm font-medium border border-emerald-100">
                            {interest.trim()}
                          </span>
                        )) : <span className="text-slate-500 italic text-sm">No especificados</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industrias</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.industries ? profileData.industries.split(',').map((industry, idx) => (
                          <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium border border-purple-100">
                            {industry.trim()}
                          </span>
                        )) : <span className="text-slate-500 italic text-sm">No especificadas</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Biografía</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[120px] text-slate-600"
                      placeholder="Cuéntanos un poco sobre ti..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Habilidades (separadas por coma)"
                      placeholder="React, Python, Finanzas..."
                      value={profileData.skills}
                      onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                    />
                    <Input 
                      label="Nivel de Experiencia"
                      placeholder="Senior, 5 años, etc."
                      value={profileData.experienceLevel}
                      onChange={(e) => setProfileData({...profileData, experienceLevel: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Intereses"
                      placeholder="Sostenibilidad, AI, Fintech..."
                      value={profileData.interests}
                      onChange={(e) => setProfileData({...profileData, interests: e.target.value})}
                    />
                    <Input 
                      label="Industrias"
                      placeholder="Agro, Tech, Salud..."
                      value={profileData.industries}
                      onChange={(e) => setProfileData({...profileData, industries: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    {user?.profile?.bio && (
                      <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="px-8 py-3 rounded-2xl font-black text-slate-600 border-slate-300">
                        Cancelar
                      </Button>
                    )}
                    <Button type="submit" loading={loading} className="px-10 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20">
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              )}
            </motion.section>
          </div>

          {/* Sidebar Column: Security */}
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Seguridad</h2>
                  <p className="text-sm font-medium text-slate-400">Protege tu cuenta</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    {user?.is2FAEnabled ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-slate-300" size={20} />
                    )}
                    <span className="font-bold text-slate-700">Autenticación 2FA</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${user?.is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                    {user?.is2FAEnabled ? 'Activado' : 'Desactivado'}
                  </span>
                </div>

                {!user?.is2FAEnabled ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Añade una capa extra de seguridad usando una aplicación de autenticación (Google Authenticator, Authy, etc.).
                    </p>
                    <Button 
                      onClick={handleStart2FASetup} 
                      variant="outline" 
                      className="w-full rounded-2xl border-2 border-blue-600 text-blue-600 font-black hover:bg-blue-50"
                    >
                      Configurar 2FA
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShow2FADisable(true)} 
                    variant="outline" 
                    className="w-full rounded-2xl border-2 border-red-600 text-red-600 font-black hover:bg-red-50"
                  >
                    Desactivar 2FA
                  </Button>
                )}
              </div>
            </motion.section>

            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
               <Rocket className="absolute -right-4 -bottom-4 text-blue-500 opacity-20 group-hover:scale-110 transition-transform" size={120} />
               <h3 className="text-xl font-black mb-2 relative z-10">¿Sabías que...?</h3>
               <p className="text-blue-100 text-sm font-medium relative z-10 leading-relaxed">
                 Tener tu perfil completo aumenta en un 40% las probabilidades de conectar con inversores y mentores.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {show2FASetup && qrCode && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShow2FASetup(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
              
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Configurar 2FA</h3>
                <p className="text-slate-500 font-medium mt-2">Escanea el código QR con tu app de autenticación</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl flex justify-center mb-8 border border-slate-100">
                {/* Mocking QR space for now, in a real app would be an img with qrUri */}
                <div className="w-48 h-48 bg-white border-4 border-white shadow-lg rounded-2xl flex items-center justify-center overflow-hidden">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode.qrUri)}`} alt="QR Code" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">O ingresa manualmente este secreto</p>
                  <code className="text-sm font-black text-blue-600 break-all">{qrCode.secret}</code>
                </div>
                
                <Input 
                  label="Código de Verificación"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                
                <Button onClick={handleVerify2FA} className="w-full rounded-2xl py-4 font-black">
                  Validar y Habilitar
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {show2FADisable && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShow2FADisable(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
              
              <div className="text-center mb-8">
                <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-4">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Desactivar 2FA</h3>
                <p className="text-slate-500 font-medium mt-2">Ingresa tu contraseña y un código para confirmar</p>
              </div>

              <div className="space-y-4">
                <Input 
                  label="Contraseña"
                  type="password"
                  placeholder="Tu contraseña"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                <Input 
                  label="Código 2FA"
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleDisable2FA} variant="danger" className="w-full rounded-2xl py-4 font-black">
                  Desactivar Definitivamente
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

import { Rocket } from 'lucide-react'
