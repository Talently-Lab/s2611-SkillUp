import CourseCard from '../components/course/CourseCard'
import { courses } from '../lib/courses'

function Catalog() {
  return (
    <>
      <h1>Catalog</h1>
      <div className="max-w-sm">
        {courses.map((course) => (
          <CourseCard
            key={course.slug}
            slug={course.slug}
            title={course.title}
            description={course.description}
            imageUrl={course.imageUrl}
          />
        ))}
      </div>
    </>
  )
}

export default Catalog