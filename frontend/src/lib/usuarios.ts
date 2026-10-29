import { z } from 'zod'
import { pedir, validar } from './apiClient'

// GET /api/admin/users todavía no existe en el backend: la forma es la
// propuesta y mientras tanto la responde MSW (src/mocks/handlers.ts).

// Los nombres de los campos del backend viven solo acá. El schema los pasa a
// los de la app, así que cuando Backend los cambie se toca únicamente esto.
const usuarioSchema = z
  .object({
    id: z.number(),
    nombre: z.string().nullable(),
    correo: z.string(),
    rol: z.enum(['alumno', 'admin']),
    // ISO 8601, con o sin zona horaria
    fecha_registro: z.iso.datetime({ offset: true, local: true }),
  })
  .transform((u) => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol,
    fechaRegistro: u.fecha_registro,
  }))

const usuariosSchema = z.object({
  datos: z.array(usuarioSchema),
})

// Lo que usa la app
export type Usuario = z.output<typeof usuarioSchema>
// Lo que manda el backend: solo para los mocks
export type UsuarioApi = z.input<typeof usuarioSchema>

export async function obtenerUsuarios(signal?: AbortSignal) {
  const datos = await pedir('/api/admin/users', { signal })
  return validar(usuariosSchema, datos, 'GET /api/admin/users').datos.sort(
    (a, b) => Date.parse(b.fechaRegistro) - Date.parse(a.fechaRegistro),
  )
}
