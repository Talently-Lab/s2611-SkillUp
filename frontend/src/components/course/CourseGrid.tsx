import type { ReactNode } from 'react'
import CourseCardSkeleton from './CourseCardSkeleton'

type CourseGridProps = {
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}

const gridClasses = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6'

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