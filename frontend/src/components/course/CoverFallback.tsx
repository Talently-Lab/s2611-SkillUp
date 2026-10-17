// Portada de reemplazo para los cursos sin url_portada
function CoverFallback() {
  return (
    <div className="flex size-full items-center justify-center bg-linear-to-br from-primary-soft/60 to-cream">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-12 text-ink/40"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </svg>
    </div>
  )
}

export default CoverFallback
