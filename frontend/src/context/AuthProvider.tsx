import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  alCerrarseSesion,
  borrarSesion,
  CLAVE_SESION,
  guardarSesion,
  leerSesion,
  type MotivoCierre,
  type Usuario,
} from '../lib/sesion'
import { AuthContext } from './authContext'

// leerSesion invalida un token vencido antes de que el useEffect de abajo
// empiece a escuchar, así que el motivo se captura acá. Funciona porque el
// aviso es sincrónico.
function leerEstadoInicial() {
  let motivoCierre: MotivoCierre | null = null
  const dejarDeEscuchar = alCerrarseSesion((motivo) => {
    motivoCierre = motivo
  })
  const usuario = leerSesion()?.usuario ?? null
  dejarDeEscuchar()
  return { usuario, motivoCierre }
}

function AuthProvider({ children }: { children: ReactNode }) {
  // Lectura sincrónica al crear el estado: al recargar, el usuario aparece
  // logueado desde el primer render, sin parpadear como deslogueado.
  const [inicial] = useState(leerEstadoInicial)
  const [usuario, setUsuario] = useState<Usuario | null>(inicial.usuario)
  const [motivoCierre, setMotivoCierre] = useState<MotivoCierre | null>(inicial.motivoCierre)

  const iniciarSesion = useCallback((token: string, nuevoUsuario: Usuario) => {
    guardarSesion({ token, usuario: nuevoUsuario })
    setUsuario(nuevoUsuario)
    setMotivoCierre(null)
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setUsuario(null)
    setMotivoCierre('manual')
  }, [])

  // Un 401 del apiClient o un token vencido cierran la sesión fuera de React
  useEffect(
    () =>
      alCerrarseSesion((motivo) => {
        setUsuario(null)
        setMotivoCierre(motivo)
      }),
    [],
  )

  // Si la sesión cambia en otra pestaña, esta se pone al día. key es null
  // cuando se vació todo el localStorage.
  useEffect(() => {
    function alCambiarStorage(evento: StorageEvent) {
      if (evento.storageArea !== localStorage) return
      if (evento.key !== CLAVE_SESION && evento.key !== null) return
      setUsuario(leerSesion()?.usuario ?? null)
      // Va después de leerSesion, que puede avisar 'expirada' si el token venció
      setMotivoCierre(null)
    }

    window.addEventListener('storage', alCambiarStorage)
    return () => window.removeEventListener('storage', alCambiarStorage)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      motivoCierre,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, motivoCierre, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export default AuthProvider
