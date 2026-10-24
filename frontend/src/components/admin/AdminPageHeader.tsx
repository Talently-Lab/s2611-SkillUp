import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  titulo: string
  descripcion?: string
  // Botón o link de la página (ej. "Nuevo curso"): a la derecha en desktop, abajo en mobile
  accion?: ReactNode
}

function AdminPageHeader({ titulo, descripcion, accion }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-ink/70 uppercase">
          Panel de administración
        </p>
        <h1 className="mt-1 text-3xl font-bold">{titulo}</h1>
        {descripcion && <p className="mt-2 text-ink/70">{descripcion}</p>}
      </div>

      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  )
}

export default AdminPageHeader
