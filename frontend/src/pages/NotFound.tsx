import { useTitulo } from '../hooks/useTitulo'

function NotFound() {
  useTitulo('Página no encontrada')

  return <h1>NotFound</h1>
}

export default NotFound
