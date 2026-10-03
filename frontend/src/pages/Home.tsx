import { useTitulo } from '../hooks/useTitulo'

function Home() {
  useTitulo('Inicio')

  return <h1>Home</h1>
}

export default Home
