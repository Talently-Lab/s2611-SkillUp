import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { esperar, useAuthForm } from '../hooks/useAuthForm'
import { useTitulo } from '../hooks/useTitulo'
import { loginSchema, type LoginDatos } from '../lib/validaciones'

async function iniciarSesion(_datos: LoginDatos) {
  // TODO(FE-05): acá va la llamada real a POST /api/auth/login.
  // Mientras tanto se simula la espera y siempre falla para mostrar el Alert.
  await esperar(1000)
  throw new Error('Simulado: sin backend todavía')
}

function Login() {
  useTitulo('Iniciar sesión')

  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    loginSchema,
    iniciarSesion,
    'Ups, el correo o la contraseña no coinciden. ¿Querés intentarlo de nuevo?',
  )

  return (
    <AuthLayout
      title="¡Qué bueno verte de nuevo!"
      subtitle="¿Listo/a para seguir creando? Ingresá a tu cuenta y retomá tus proyectos donde los dejaste."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorGeneral && <Alert ref={alertRef}>{errorGeneral}</Alert>}

        <FormField label="Tu correo principal" error={errores.correo} required>
          <Input name="correo" type="email" autoComplete="email" />
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
