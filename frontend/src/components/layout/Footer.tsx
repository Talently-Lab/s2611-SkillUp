function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-ink/70 sm:px-6 lg:px-8">
        <p>SkillUp Campus &copy; {year}</p>
      </div>
    </footer>
  )
}

export default Footer
