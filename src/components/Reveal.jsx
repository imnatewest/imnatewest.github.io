import { useEffect, useRef, useState } from 'react'

function Reveal({
  as: Component = 'div',
  className = '',
  animationClass = 'motion-safe:animate-fade-in-up animate-once',
  hiddenClass = 'opacity-0 translate-y-6',
  threshold = 0.2,
  children,
  ...rest
}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const stateClass = isVisible ? animationClass : hiddenClass

  return (
    <Component ref={ref} className={`${className} ${stateClass}`} {...rest}>
      {children}
    </Component>
  )
}

export default Reveal
