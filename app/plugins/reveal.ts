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
    beforeMount(element: HTMLElement) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Hold the first frame before paint, including the stagger delay.
      const animation = element.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' })
      animation.pause()
      animation.addEventListener('finish', () => animations.delete(element), { once: true })
      animations.set(element, animation)
    },
    mounted(element: HTMLElement) {
      const animation = animations.get(element)
      if (!animation) return
      const delay = parseFloat(getComputedStyle(element).getPropertyValue('--reveal-delay')) || 0
      animation.effect?.updateTiming({ delay })
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer.disconnect()
        observers.delete(element)
        animation.play()
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
