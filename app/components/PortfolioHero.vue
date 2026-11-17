<script setup lang="ts">
import { showcases, trailingPath } from '~~/shared/portfolio'
const selected = ref(0)
const enhanced = ref(false)
const current = computed(() => showcases[selected.value]!)
const wordmark = ref<HTMLElement | null>(null)
const mastheadVisible = useState('homepage-masthead-visible', () => true)
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
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
})
onBeforeUnmount(() => {
  observer?.disconnect()
  resizeObserver?.disconnect()
  mastheadVisible.value = true
})
</script>

<template>
  <section class="portfolio-hero page-shell" aria-labelledby="hero-title">
    <h1 id="hero-title" ref="wordmark" class="hero-wordmark">WOPIAN<span class="heading-dot" aria-hidden="true">.</span></h1>
    <div class="hero-index">
      <div v-if="enhanced" class="genre-controls" role="group" aria-label="Select featured photography genre">
        <button v-for="(showcase, index) in showcases" :key="showcase.genre" type="button" :aria-pressed="selected === index" @click="selected = index">{{ showcase.label }}</button>
      </div>
      <a v-else href="#category-index" class="text-link">Browse categories</a>
    </div>
    <div class="hero-spread">
      <NuxtLink :to="trailingPath(current.albumPath)" class="hero-main-print" :aria-label="`View ${current.title} album`">
        <PortfolioImage :src="current.photoUrl" :alt="`${current.title} — selected photograph`" :position="current.focalPosition" eager />
      </NuxtLink>
      <div class="hero-side">
        <NuxtLink v-for="(photo, index) in current.supportingPhotos" :key="index" :to="trailingPath(current.albumPath)" class="hero-small-print" :aria-label="`View ${current.title}, selected frame ${index + 2}`">
          <PortfolioImage :src="photo.url" :alt="`${current.title} — selected photograph ${index + 2}`" :position="photo.position" />
        </NuxtLink>
      </div>
    </div>
    <div class="hero-caption"><div aria-live="polite" aria-atomic="true"><NuxtLink :to="trailingPath(current.albumPath)">{{ current.title }} <span aria-hidden="true">↗</span></NuxtLink></div><a href="#latest-albums" class="text-link">Latest albums <span aria-hidden="true">↓</span></a></div>
  </section>
</template>
