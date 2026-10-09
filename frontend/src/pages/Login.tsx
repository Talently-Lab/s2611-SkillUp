import { Link, useLocation } from 'react-router-dom'
import { z } from 'zod'
import AuthLayout from '../layouts/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { useAuthForm } from '../hooks/useAuthForm'
import { useTitulo } from '../hooks/useTitulo'
import { pedir } from '../lib/apiClient'
import { usuarioSchema } from '../lib/sesion'
import { loginSchema, type LoginDatos } from '../lib/validaciones'

// Respuesta de POST /api/auth/login según el contrato v1
const respuestaLoginSchema = z.object({
  token: z.string().min(1),
  usuario: usuarioSchema,
})

// Register manda { registro: { correo } } al terminar. El state del historial
// puede traer cualquier cosa, así que se valida antes de usarlo.
function leerRegistro(state: unknown): { correo: string } | null {
  if (typeof state !== 'object' || state === null || !('registro' in state)) return null
  const registro = state.registro
  if (typeof registro !== 'object' || registro === null || !('correo' in registro)) return null
  return typeof registro.correo === 'string' ? { correo: registro.correo } : null
}

function Login() {
  useTitulo('Iniciar sesión')
  const registro = leerRegistro(useLocation().state)
  const { iniciarSesion } = useAuth()

  async function entrar({ correo, contrasenia }: LoginDatos) {
    const respuesta = await pedir('/api/auth/login', {
      metodo: 'POST',
      cuerpo: { correo, contrasenia },
    })

    const resultado = respuestaLoginSchema.safeParse(respuesta)
    if (!resultado.success) {
      console.error('La respuesta del login no coincide con el contrato:', resultado.error)
      // No es un ApiError a propósito: useAuthForm muestra el mensaje genérico
      throw new Error('Respuesta de login inválida')
    }

    // No se navega acá: al haber sesión, SoloInvitados redirige a "desde" o
    // según el rol.
    iniciarSesion(resultado.data.token, resultado.data.usuario)
  }

  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    loginSchema,
    entrar,
    { 401: 'Ups, el correo o la contraseña no coinciden. ¿Querés intentarlo de nuevo?' },
  )

  return (
    <AuthLayout
      title="¡Qué bueno verte de nuevo!"
      subtitle="¿Listo/a para seguir creando? Ingresá a tu cuenta y retomá tus proyectos donde los dejaste."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorGeneral && <Alert ref={alertRef}>{errorGeneral}</Alert>}

        {/* Texto provisorio: confirmar con Marketing */}
        {registro && !errorGeneral && (
          <Alert variant="success">
            ¡Listo! Tu cuenta ya está creada. Ingresá con tu correo y contraseña.
          </Alert>
        )}

        <FormField label="Tu correo principal" error={errores.correo} required>
          <Input name="correo" type="email" autoComplete="email" defaultValue={registro?.correo} />
        </FormField>

        <FormField label="Contraseña" error={errores.contrasenia} required>
          <Input name="contrasenia" type="password" autoComplete="current-password" />
        </FormField>

        <Button type="submit" fullWidth loading={enviando} className="mt-2">
          Entrar al campus
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/70">
        ¿Todavía no tenés cuenta?{' '}
        <Link to="/registro" className="font-semibold text-ink underline underline-offset-4 hover:no-underline">
          Registrate
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
