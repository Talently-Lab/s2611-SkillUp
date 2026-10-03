import { useTitulo } from '../hooks/useTitulo'

function ErrorPage() {
  useTitulo('Algo salió mal')

  return <h1>ErrorPage</h1>
}

export default ErrorPage
