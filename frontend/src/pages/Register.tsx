import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { useAuthForm } from '../hooks/useAuthForm'
import { useTitulo } from '../hooks/useTitulo'
import { registrarEvento, registrarVistaUnaVez, tipoDeError } from '../lib/analytics'
import { MENSAJE_DEMASIADOS_INTENTOS, pedir } from '../lib/apiClient'
import { registroSchema, type RegistroDatos } from '../lib/validaciones'

function Register() {
  useTitulo('Crear cuenta')
  const navigate = useNavigate()

  async function registrarse({ nombre, correo, contrasenia }: RegistroDatos) {
    // La ruta y los nombres de campo son los del backend actual, que difieren
    // del contrato. El apellido es opcional en el backend y no lo pedimos.
    // Responde 201 sin token, así que el usuario sigue en el login.
    try {
      await pedir('/api/auth/register', {
        metodo: 'POST',
        cuerpo: { nombre, correo, contrasenia },
      })
    } catch (error) {
      // GA4: el motivo del error según la matriz de Data. Se vuelve a
      // lanzar para que el formulario muestre el aviso como siempre
      registrarEvento('register_error', {
        error_type: tipoDeError(error, {
          400: 'datos_incompletos',
          409: 'correo_duplicado',
          429: 'demasiados_intentos',
        }),
      })
      throw error
    }
    registrarEvento('register_success')
    navigate('/login', { state: { registro: { correo } } })
  }

  // GA4: una vez por visita al formulario
  useEffect(() => {
    registrarVistaUnaVez('view_register_form')
  }, [])

  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    registroSchema,
    registrarse,
    {
      409: 'Este correo ya tiene una cuenta activa. ¿Será que ya te registraste antes? Probá iniciando sesión.',
      429: MENSAJE_DEMASIADOS_INTENTOS,
    },
  )

  // GA4: si zod rechaza el formulario, error_field dice qué campo falló primero.
  // Solo el nombre del campo, nunca lo que escribió la persona
  useEffect(() => {
    const campo = Object.keys(errores).find((nombre) => errores[nombre as keyof typeof errores])
    if (campo) registrarEvento('register_error', { error_type: 'validacion_formulario', error_field: campo })
  }, [errores])

  return (
    <AuthLayout
      title="Tu carrera en tecnología arranca acá."
      subtitle="Completá tus datos, sumate a nuestra comunidad y empezá a construir tu primer proyecto hoy mismo."
    >
      <form
        noValidate
        onSubmit={(evento) => {
          // GA4: al presionar el botón, antes de validar
          registrarEvento('click_register')
          handleSubmit(evento)
        }}
        className="flex flex-col gap-5"
      >
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
