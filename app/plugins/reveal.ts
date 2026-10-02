export default defineNuxtPlugin(nuxtApp => {
  const observers = new Map<HTMLElement, IntersectionObserver>()
  const animations = new Map<HTMLElement, Animation>()
  if (import.meta.client) {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
      if (!event.matches) return
      for (const observer of observers.values()) observer.disconnect()
      for (const animation of animations.values()) animation.cancel()
      observers.clear()
      animations.clear()
    })
  }
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(element: HTMLElement) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        const delay = parseFloat(getComputedStyle(element).getPropertyValue('--reveal-delay')) || 0
        animations.set(element, element.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay, easing: 'cubic-bezier(.2,.7,.2,1)' }))
        observer.disconnect()
        observers.delete(element)
      }, { threshold: 0.08 })
      observers.set(element, observer)
      observer.observe(element)
    },
    unmounted(element: HTMLElement) {
      observers.get(element)?.disconnect()
      animations.get(element)?.cancel()
      observers.delete(element)
      animations.delete(element)
    },
  })
})
