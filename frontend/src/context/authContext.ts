import { createContext } from 'react'
import type { Usuario } from '../lib/sesion'

export type AuthContextValue = {
  usuario: Usuario | null
  estaAutenticado: boolean
  iniciarSesion: (token: string, usuario: Usuario) => void
  cerrarSesion: () => void
}

// Separado de AuthProvider.tsx para que ese archivo exporte solo el componente.
export const AuthContext = createContext<AuthContextValue | null>(null)
