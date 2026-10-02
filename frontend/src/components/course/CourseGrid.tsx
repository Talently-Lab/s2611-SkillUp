import type { ReactNode } from 'react'

type CourseGridProps = {
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}

const gridClasses = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6'

// Tiene la forma de una CourseCard para que la página no salte al cargar
function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-sm">
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

function CourseGrid({
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'Todavía no hay cursos para mostrar.',
  children,
}: CourseGridProps) {
  if (isLoading) {
    return (
      <div className={gridClasses} aria-busy="true" aria-label="Cargando cursos">
        {Array.from({ length: 6 }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-cream/50 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">No encontramos cursos</p>
        <p className="mt-1 text-sm text-ink/70">{emptyMessage}</p>
      </div>
    )
  }

  return <div className={gridClasses}>{children}</div>
}

export default CourseGrid