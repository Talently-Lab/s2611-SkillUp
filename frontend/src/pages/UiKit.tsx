import { useEffect, useRef, useState } from 'react'
import EnrollButton from '../components/course/EnrollButton'
import SesionDePrueba from '../components/dev/SesionDePrueba'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import { useTitulo } from '../hooks/useTitulo'

// Simula una acción que tarda 1 segundo para ver el estado cargando
function ConfirmDialogDemo() {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function confirmar() {
    setCargando(true)
    timeoutRef.current = setTimeout(() => {
      setCargando(false)
      setAbierto(false)
    }, 1000)
  }

  return (
    <>
      <Button variant="danger" onClick={() => setAbierto(true)}>
        Eliminar curso
      </Button>

      <ConfirmDialog
        open={abierto}
        titulo="¿Eliminar este curso?"
        mensaje="Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        variante="peligro"
        cargando={cargando}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  )
}

// Página interna para ver todos los primitivos juntos (FE-06). No va en el Navbar.
function UiKit() {
  useTitulo('UI Kit')

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">UI Kit</h1>

      {import.meta.env.DEV && (
        <>
          <SesionDePrueba />

          <section className="mb-10">
            <h2 className="mb-1 text-xl font-semibold">EnrollButton</h2>
            <p className="mb-4 text-sm text-ink/70">
              Curso 1. Con VITE_MOCKS=true responde MSW; probá cada rol con la sesión de prueba.
            </p>
            <EnrollButton courseId={1} />
          </section>
        </>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Button</h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button loading>Guardando</Button>
          <Button variant="danger" loading>
            Borrando
          </Button>
          <Button disabled>Deshabilitado</Button>
          <Button to="/cursos">Como link (va a /cursos)</Button>
        </div>

        <div className="mt-4 max-w-sm">
          <Button size="lg" fullWidth>
            Ancho completo
          </Button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Badge</h2>

        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="brand">Frontend</Badge>
          <Badge>Nivel: Principiante</Badge>
          <Badge tone="dark">Admin</Badge>
          <Badge>Alumno</Badge>
          <Badge tone="success">Activa</Badge>
          <Badge tone="danger">Cancelada</Badge>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">ConfirmDialog</h2>
        <ConfirmDialogDemo />
      </section>

      <section className="mb-10 max-w-md">
        <h2 className="mb-4 text-xl font-semibold">Input y FormField</h2>

        <div className="flex flex-col gap-5">
          <FormField label="Nombre">
            <Input placeholder="Tu nombre" />
          </FormField>

          <FormField label="Correo" hint="Usá el mail con el que te registraste" required>
            <Input type="email" placeholder="tu@email.com" />
          </FormField>

          <FormField label="Contraseña" required>
            <Input type="password" placeholder="Mínimo 8 caracteres" />
          </FormField>

          <FormField label="Correo" error="Este correo ya está registrado">
            <Input type="email" defaultValue="ana@email.com" />
          </FormField>

          <FormField label="Campo deshabilitado">
            <Input disabled defaultValue="No se puede editar" />
          </FormField>
        </div>
      </section>
    </>
  )
}

export default UiKit