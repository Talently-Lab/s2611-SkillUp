import { useTitulo } from '../hooks/useTitulo'

function Dashboard() {
  useTitulo('Mis cursos')

  return <h1>Dashboard</h1>
}

export default Dashboard
