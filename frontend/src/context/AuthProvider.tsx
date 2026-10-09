import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  alCerrarseSesion,
  borrarSesion,
  CLAVE_SESION,
  guardarSesion,
  leerSesion,
  type Usuario,
} from '../lib/sesion'
import { AuthContext } from './authContext'

function AuthProvider({ children }: { children: ReactNode }) {
  // Lectura sincrónica al crear el estado: al recargar, el usuario aparece
  // logueado desde el primer render, sin parpadear como deslogueado.
  const [usuario, setUsuario] = useState<Usuario | null>(() => leerSesion()?.usuario ?? null)

  const iniciarSesion = useCallback((token: string, nuevoUsuario: Usuario) => {
    guardarSesion({ token, usuario: nuevoUsuario })
    setUsuario(nuevoUsuario)
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setUsuario(null)
  }, [])

  // Un 401 del apiClient o un token vencido cierran la sesión fuera de React
  useEffect(() => alCerrarseSesion(() => setUsuario(null)), [])

  // Si la sesión cambia en otra pestaña, esta se pone al día. key es null
  // cuando se vació todo el localStorage.
  useEffect(() => {
    function alCambiarStorage(evento: StorageEvent) {
      if (evento.storageArea !== localStorage) return
      if (evento.key !== CLAVE_SESION && evento.key !== null) return
      setUsuario(leerSesion()?.usuario ?? null)
    }

    window.addEventListener('storage', alCambiarStorage)
    return () => window.removeEventListener('storage', alCambiarStorage)
  }, [])

  const valor = useMemo(
    () => ({ usuario, estaAutenticado: usuario !== null, iniciarSesion, cerrarSesion }),
    [usuario, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export default AuthProvider
