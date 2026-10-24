import { useEffect, useId, useRef, type SyntheticEvent } from 'react'
import Button from './Button'

type Variante = 'peligro' | 'normal'

type ConfirmDialogProps = {
  open: boolean
  titulo: string
  mensaje: string
  textoConfirmar: string
  variante?: Variante
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

function ConfirmDialog({
  open,
  titulo,
  mensaje,
  textoConfirmar,
  variante = 'normal',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)
  const tituloId = useId()
  const mensajeId = useId()

  // La prop open manda: el dialog nativo solo se abre o cierra desde acá
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelarRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Escape dispara "cancel". Se frena el cierre nativo y se avisa al padre,
  // que es quien cambia open; así el estado de React no queda desincronizado.
  function manejarCancel(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault()
    if (!cargando) onCancelar()
  }

  // Chrome deja cerrar con un segundo Escape aunque se haya frenado el
  // primero. Si el dialog se cerró sin que open cambie, se resincroniza.
  function manejarClose() {
    if (!open) return
    if (cargando) dialogRef.current?.showModal()
    else onCancelar()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={tituloId}
      aria-describedby={mensajeId}
      onCancel={manejarCancel}
      onClose={manejarClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <h2 id={tituloId} className="text-xl font-semibold">
        {titulo}
      </h2>
      <p id={mensajeId} className="mt-2 text-ink/70">
        {mensaje}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button ref={cancelarRef} variant="secondary" disabled={cargando} onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          variant={variante === 'peligro' ? 'danger' : 'primary'}
          loading={cargando}
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </Button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
