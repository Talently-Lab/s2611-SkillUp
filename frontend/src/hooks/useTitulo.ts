import { useEffect } from 'react'

// Tiene que coincidir con el <title> de index.html.
const TITULO_BASE = 'SkillUp Campus'

// Pone el título de la pestaña como "<titulo> · SkillUp Campus" y al desmontar
// la página vuelve al título base.
export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · ${TITULO_BASE}`
    return () => {
      document.title = TITULO_BASE
    }
  }, [titulo])
}
