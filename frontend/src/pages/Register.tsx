import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { esperar, useAuthForm } from '../hooks/useAuthForm'
import { registroSchema, type RegistroDatos } from '../lib/validaciones'

async function registrarse(_datos: RegistroDatos) {
  // TODO(FE-05): acá va la llamada real a POST /api/auth/registro.
  // Mientras tanto se simula la espera y siempre falla para mostrar el Alert.
  await esperar(1000)
  throw new Error('Simulado: sin backend todavía')
}

function Register() {
  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    registroSchema,
    registrarse,
    'Este correo ya tiene una cuenta activa. ¿Será que ya te registraste antes? Probá iniciando sesión.',
  )

  return (
    <AuthLayout
      title="Tu carrera en tecnología arranca acá."
      subtitle="Completá tus datos, sumate a nuestra comunidad y empezá a construir tu primer proyecto hoy mismo."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorGeneral && <Alert ref={alertRef}>{errorGeneral}</Alert>}

        <FormField label="¿Cómo te llamás?" error={errores.nombre} required>
          <Input name="nombre" autoComplete="name" />
        </FormField>

        <FormField label="Tu correo principal" error={errores.correo} required>
          <Input name="correo" type="email" autoComplete="email" />
        </FormField>

        <FormField label="Creá una contraseña segura" error={errores.contrasenia} required>
          <Input name="contrasenia" type="password" autoComplete="new-password" />
        </FormField>

        <Button type="submit" fullWidth loading={enviando} className="mt-2">
          Empezá a aprender hoy
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/70">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-ink underline underline-offset-4 hover:no-underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
