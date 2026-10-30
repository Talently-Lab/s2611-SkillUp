import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { useAuthForm } from '../hooks/useAuthForm'
import { useTitulo } from '../hooks/useTitulo'
import { MENSAJE_DEMASIADOS_INTENTOS, pedir } from '../lib/apiClient'
import { registroSchema, type RegistroDatos } from '../lib/validaciones'

function Register() {
  useTitulo('Crear cuenta')
  const navigate = useNavigate()

  async function registrarse({ nombre, correo, contrasenia }: RegistroDatos) {
    // La ruta y los nombres de campo son los del backend actual, que difieren
    // del contrato. El apellido es opcional en el backend y no lo pedimos.
    // Responde 201 sin token, así que el usuario sigue en el login.
    await pedir('/api/auth/register', {
      metodo: 'POST',
      cuerpo: { nombre, correo, contrasenia },
    })
    navigate('/login', { state: { registro: { correo } } })
  }

  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    registroSchema,
    registrarse,
    {
      // Texto provisorio: confirmar con Marketing
      400: 'Revisá los datos que completaste y volvé a intentar.',
      409: 'Este correo ya tiene una cuenta activa. ¿Será que ya te registraste antes? Probá iniciando sesión.',
      429: MENSAJE_DEMASIADOS_INTENTOS,
    },
  )

  return (
    <AuthLayout
      title="Tu carrera en tecnología arranca acá."
      subtitle="Completá tus datos, sumate a nuestra comunidad y empezá a construir tu primer proyecto hoy mismo."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorGeneral && <Alert ref={alertRef}>{errorGeneral}</Alert>}

        <FormField label="¿Cómo te llamás?" error={errores.nombre} required>
          <Input name="nombre" autoComplete="given-name" />
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
