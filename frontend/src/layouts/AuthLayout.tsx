import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import authImage from '../assets/auth.webp'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

// En celular el título queda arriba del formulario, sin el panel cream, para que
// la página no se quede sin h1. Desde md se arma el panel de la izquierda.
function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh bg-surface">
      <header className="absolute inset-x-0 top-0 z-10 px-4 py-5 md:py-4 lg:px-6 lg:py-5">
        <Link
          to="/"
          className="rounded-md font-display text-lg font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-xl"
        >
          SkillUp Campus
        </Link>
      </header>

      <main className="flex min-h-dvh flex-col justify-center gap-8 px-4 pt-20 pb-10 md:grid md:grid-cols-2 md:gap-0 md:p-0">
        {/* Desde md, el padding de arriba deja lugar al logo por encima del marco de la foto. */}
        <section className="mx-auto w-full max-w-md md:mx-0 md:flex md:max-w-none md:flex-col md:p-4 md:pt-16 lg:p-6 lg:pt-18">
          <div className="relative md:flex md:flex-1 md:flex-col md:justify-end md:overflow-hidden md:rounded-3xl md:p-8 xl:p-12">
            {/* Decorativa y solo desde md: con lazy, en celular (oculta) no se descarga. */}
            <img
              src={authImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 hidden size-full scale-105 object-cover object-[65%_55%] blur-[1px] md:block"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-linear-to-t from-ink/40 via-primary/10 to-transparent md:block"
            />
            <div className="relative md:max-w-md md:rounded-2xl md:border md:border-white/40 md:bg-cream/90 md:p-6 md:shadow-lg md:backdrop-blur-md xl:p-8">
              <h1 className="text-2xl font-bold text-balance md:text-3xl">{title}</h1>
              <p className="mt-3 text-base text-pretty text-ink/70 md:mt-4 md:text-lg">{subtitle}</p>
            </div>
          </div>
        </section>

        <div className="md:flex md:items-center md:justify-center md:px-12 md:py-28">
          <div className="squircle mx-auto w-full max-w-md md:rounded-2xl md:border md:border-ink/10 md:bg-surface md:p-8 md:shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
