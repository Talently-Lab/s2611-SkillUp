import { z } from 'zod'

export const MENSAJES = {
  vacio: 'Nos falta este dato para poder avanzar.',
  correo: 'Ese correo no parece válido. Revisalo y probá de nuevo.',
  contrasenaCorta: 'Para que tu cuenta pueda estar segura, tu contraseña tiene que tener al menos 8 caracteres.',
  nombreCorto: 'El nombre necesita al menos 2 caracteres.',
  nombreLargo: 'El nombre puede tener hasta 50 caracteres. Probá con una versión más corta.',
  // TODO: Textos provisorios del formulario de cursos, confirmar con Marketing
  slug: 'Usá solo minúsculas, números y guiones, sin espacios (ej: react-desde-cero).',
  url: 'Pegá una dirección completa que empiece con http:// o https://',
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
  nombre: z
    .string()
    .trim()
    .min(1, MENSAJES.vacio)
    .min(2, MENSAJES.nombreCorto)
    .max(50, MENSAJES.nombreLargo),
  correo,
  contrasenia: z.string().min(1, MENSAJES.vacio).min(8, MENSAJES.contrasenaCorta),
})

export const loginSchema = z.object({
  correo,
  contrasenia: z.string().min(1, MENSAJES.vacio),
})

// Valores que acepta el backend según el contrato v1
export const CATEGORIAS = [
  'frontend',
  'backend',
  'devops',
  'ciberseguridad',
  'datos',
  'mobile',
  'diseño',
  'marketing',
] as const
export const NIVELES = ['inicial', 'intermedio', 'avanzado'] as const

// Formulario de crear y editar curso del panel admin. El backend exige titulo y
// slug, el resto es opcional. Los campos vacíos se mandan como texto vacío
export const cursoSchema = z.object({
  titulo: z.string().trim().min(1, MENSAJES.vacio),
  slug: z
    .string()
    .trim()
    .min(1, MENSAJES.vacio)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, MENSAJES.slug),
  resumen: z.string().trim(),
  descripcion: z.string().trim(),
  // '' significa que no tiene categoría. Acepta cualquier texto para no rechazar 
  // una categoría vieja que no está en la lista, la lista solo limita lo que se puede elegir
  categoria: z.string().trim(),
  nivel: z.enum(NIVELES),
  url_portada: z
    .string()
    .trim()
    .refine((valor) => valor === '' || /^https?:\/\/\S+$/.test(valor), MENSAJES.url),
})

export type RegistroDatos = z.infer<typeof registroSchema>
export type LoginDatos = z.infer<typeof loginSchema>
export type CursoFormDatos = z.infer<typeof cursoSchema>
