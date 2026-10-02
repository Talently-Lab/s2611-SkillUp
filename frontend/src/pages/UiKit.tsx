import Button from '../components/ui/Button'

// Página interna para ver todos los primitivos juntos (FE-06). No va en el Navbar.
function UiKit() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">UI Kit</h1>

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
    </>
  )
}

export default UiKit