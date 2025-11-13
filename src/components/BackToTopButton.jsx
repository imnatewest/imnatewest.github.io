import { useEffect, useState } from 'react'

function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/40 transition hover:-translate-y-1 motion-safe:animate-fade-in-up"
      aria-label="Back to top"
    >
      ↑
    </button>
  )
}

export default BackToTopButton
