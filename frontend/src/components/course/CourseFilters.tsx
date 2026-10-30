import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { nivelLabel, type Nivel } from '../../lib/courses'

export type Filtros = {
  query: string
  categoria: string
  nivel: string
}

type CourseFiltersProps = {
  filtros: Filtros
  categorias: string[]
  onCambiar: (cambios: Partial<Filtros>) => void
  onLimpiar: () => void
}

// espera antes de buscar, para no filtrar con cada letra
const ESPERA_MS = 300

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function CourseFilters({ filtros, categorias, onCambiar, onLimpiar }: CourseFiltersProps) {
  const [texto, setTexto] = useState(filtros.query)
  const [queryAnterior, setQueryAnterior] = useState(filtros.query)

  // si la URL cambia desde afuera (atrás/adelante o limpiar), actualizo el input
  if (filtros.query !== queryAnterior) {
    setQueryAnterior(filtros.query)
    setTexto(filtros.query)
  }

  // debounce: recién mando la búsqueda cuando el usuario deja de escribir
  useEffect(() => {
    if (texto === filtros.query) return
    const timer = setTimeout(() => onCambiar({ query: texto }), ESPERA_MS)
    return () => clearTimeout(timer)
  }, [texto, filtros.query, onCambiar])

  const hayFiltros = Boolean(filtros.query || filtros.categoria || filtros.nivel)

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="mb-8 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Buscar
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: React, datos, diseño"
          autoComplete="off"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Categoría
        <Select value={filtros.categoria} onChange={(e) => onCambiar({ categoria: e.target.value })}>
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {capitalizar(c)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Nivel
        <Select value={filtros.nivel} onChange={(e) => onCambiar({ nivel: e.target.value })}>
          <option value="">Todos</option>
          {(Object.keys(nivelLabel) as Nivel[]).map((n) => (
            <option key={n} value={n}>
              {nivelLabel[n]}
            </option>
          ))}
        </Select>
      </label>

      {hayFiltros && (
        <Button type="button" variant="secondary" onClick={onLimpiar}>
          Limpiar filtros
        </Button>
      )}
    </form>
  )
}

export default CourseFilters
