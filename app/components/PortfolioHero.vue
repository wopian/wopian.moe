<script setup lang="ts">
import { showcases, trailingPath } from '~~/shared/portfolio'
import { photoRotation } from '~~/shared/photo-rotation'
const selected = ref(0)
const enhanced = ref(false)
const current = computed(() => showcases[selected.value]!)
const wordmark = ref<HTMLElement | null>(null)
const printTitle = ref<HTMLElement | null>(null)
const printTitleText = ref<HTMLElement | null>(null)
const mastheadVisible = useState('homepage-masthead-visible', () => true)
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let titleObserver: ResizeObserver | undefined
function fitPrintTitle() {
  const container = printTitle.value
  const text = printTitleText.value
  if (!container || !text || !container.clientWidth || !container.clientHeight) return
  const maximum = Math.min(72, container.clientHeight * 0.72)
  text.style.fontSize = `${maximum}px`
  const size = Math.min(maximum, maximum * (container.clientWidth - 2) / Math.max(1, text.scrollWidth))
  text.style.fontSize = `${Math.floor(size * 100) / 100}px`
}
watch(() => current.value.title, fitPrintTitle, { flush: 'post' })
onMounted(() => {
  enhanced.value = true
  const header = document.querySelector('.site-header')
  function observeWordmark() {
    observer?.disconnect()
    if (!wordmark.value) return
    const headerHeight = header?.getBoundingClientRect().height ?? 0
    const bounds = wordmark.value.getBoundingClientRect()
    mastheadVisible.value = bounds.bottom > headerHeight && bounds.top < window.innerHeight
    observer = new IntersectionObserver(([entry]) => {
      if (entry) mastheadVisible.value = entry.isIntersecting
    }, { rootMargin: `-${headerHeight}px 0px 0px 0px` })
    observer.observe(wordmark.value)
  }
  observeWordmark()
  if (header) {
    resizeObserver = new ResizeObserver(observeWordmark)
    resizeObserver.observe(header)
  }
  fitPrintTitle()
  titleObserver = new ResizeObserver(fitPrintTitle)
  if (printTitle.value) titleObserver.observe(printTitle.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  resizeObserver?.disconnect()
  titleObserver?.disconnect()
  mastheadVisible.value = true
})
</script>

<template>
  <section class="portfolio-hero page-shell" aria-labelledby="hero-title">
    <h1 id="hero-title" ref="wordmark" class="hero-wordmark">WOPIAN<span class="heading-dot" aria-hidden="true">.</span></h1>
    <div class="hero-spread">
      <NuxtLink :to="trailingPath(current.albumPath)" class="hero-main-print" :style="{ '--print-rotation': photoRotation(current.photoUrl) }" :aria-label="`View ${current.title} album`">
        <PortfolioImage :src="current.photoUrl" :alt="`${current.title} — selected photograph`" :position="current.focalPosition" eager />
        <span ref="printTitle" class="hero-print-title" :style="{ '--hero-title-length': current.title.length }" aria-live="polite" aria-atomic="true"><span ref="printTitleText" class="hero-print-title-text">{{ current.title }}</span></span>
      </NuxtLink>
      <div class="hero-side-group">
        <div class="hero-index">
          <div v-if="enhanced" class="genre-controls" role="group" aria-label="Select featured photography genre">
            <button v-for="(showcase, index) in showcases" :key="showcase.genre" type="button" :aria-pressed="selected === index" @click="selected = index">{{ showcase.label }}</button>
          </div>
          <a v-else href="#category-index" class="text-link">Browse categories</a>
        </div>
        <div class="hero-side">
          <NuxtLink v-for="(photo, index) in current.supportingPhotos" :key="index" :to="trailingPath(current.albumPath)" class="hero-small-print" :style="{ '--print-rotation': photoRotation(photo.url, 5) }" :aria-label="`View ${current.title}, selected frame ${index + 2}`">
            <PortfolioImage :src="photo.url" :alt="`${current.title} — selected photograph ${index + 2}`" :position="photo.position" />
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="hero-caption"><a href="#latest-albums" class="text-link">Latest albums <span aria-hidden="true">↓</span></a></div>
  </section>
</template>
