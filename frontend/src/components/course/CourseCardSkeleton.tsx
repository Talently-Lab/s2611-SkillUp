// Lugar de una card mientras carga: tiene la forma de una CourseCard para que
// la página no salte cuando llegan los datos. Sirve para cualquier grilla de
// cursos (catálogo, dashboard). Es decorativo: quien lo usa anuncia la carga.
function CourseCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-sm">
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="aspect-video rounded-xl bg-cream" />
        <div className="mt-4 h-4 w-28 rounded bg-cream" />
        <div className="mt-3 h-6 w-4/5 rounded bg-cream" />
        <div className="mt-3 h-4 w-full rounded bg-cream" />
        <div className="mt-2 h-4 w-2/3 rounded bg-cream" />
        <div className="mt-6 h-12 rounded-xl bg-cream" />
      </div>
    </div>
  )
}

export default CourseCardSkeleton
