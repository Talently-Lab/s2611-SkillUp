import { Link } from 'react-router-dom'

type CourseCardProps = {
  slug: string
  title: string
  description: string
  imageUrl: string
}

function CourseCard({ slug, title, description, imageUrl }: CourseCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="line-clamp-3 text-sm text-ink/70">{description}</p>

        <Link
          to={`/cursos/${slug}`}
          className="mt-auto self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-ink hover:bg-primary-soft"
        >
          Ver más
        </Link>
      </div>
    </article>
  )
}

export default CourseCard