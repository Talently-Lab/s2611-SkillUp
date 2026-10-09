import { z } from 'zod'

export const MENSAJES = {
  vacio: 'Nos falta este dato para poder avanzar.',
  correo: 'Ese correo no parece válido. Revisalo y probá de nuevo.',
  contrasenaCorta: 'La contraseña necesita al menos 8 caracteres.',
}

// El pipe hace que el formato de email se revise solo si el campo no está vacío,
// así cada campo muestra un único error. Va en minúsculas porque el backend
// compara el correo exacto: así evitamos cuentas duplicadas por mayúsculas.
const correo = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, MENSAJES.vacio)
  .pipe(z.email(MENSAJES.correo))

export const registroSchema = z.object({
  correo,
  contrasenia: z.string().min(1, MENSAJES.vacio).min(8, MENSAJES.contrasenaCorta),
})

export const loginSchema = z.object({
  correo,
  contrasenia: z.string().min(1, MENSAJES.vacio),
})

export type RegistroDatos = z.infer<typeof registroSchema>
export type LoginDatos = z.infer<typeof loginSchema>
