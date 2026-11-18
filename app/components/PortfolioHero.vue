<script setup lang="ts">
import { showcases, trailingPath } from '~~/shared/portfolio'
import { photoRotation } from '~~/shared/photo-rotation'
import { chekiDateLines, chekiLocationLines } from '~~/shared/cheki-caption'
import type { AlbumSource } from '~~/shared/portfolio'
const props = withDefaults(defineProps<{ albums?: AlbumSource[] }>(), { albums: () => [] })
const selected = ref(0)
const current = computed(() => showcases[selected.value]!)
const currentAlbum = computed(() => props.albums.find(album => album.path === current.value.albumPath))
const locationLines = computed(() => chekiLocationLines(currentAlbum.value?.location))
const dateLines = computed(() => currentAlbum.value ? chekiDateLines(currentAlbum.value.date) : [])
const wordmark = ref<HTMLElement | null>(null)
const spread = ref<HTMLElement | null>(null)
let printAnimations: Animation[] = []
let selectionVersion = 0

function cancelPrintAnimations() {
  selectionVersion++
  for (const animation of printAnimations) animation.cancel()
  printAnimations = []
}

async function selectGenre(index: number, event: MouseEvent) {
  if (index === selected.value) return
  cancelPrintAnimations()
  selected.value = index
  if (event.detail === 0) return

  const version = selectionVersion
  await nextTick()
  if (version !== selectionVersion || !spread.value) return

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const easing = getComputedStyle(spread.value).getPropertyValue('--ease-out').trim()
  const frames = reduced
    ? [{ opacity: 0.96 }, { opacity: 1 }]
    : [{ opacity: 0.82, translate: '0 4px' }, { opacity: 1, translate: '0 0' }]
  printAnimations = Array.from(spread.value.querySelectorAll('.hero-main-print, .hero-small-print'),
    print => print.animate(frames, { duration: reduced ? 80 : 180, easing }))
}
const mastheadVisible = useState('homepage-masthead-visible', () => true)
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
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
  cancelPrintAnimations()
  observer?.disconnect()
  resizeObserver?.disconnect()
  mastheadVisible.value = true
})
</script>

<template>
  <section class="portfolio-hero page-shell" aria-labelledby="hero-title">
    <h1 id="hero-title" ref="wordmark" class="hero-wordmark">WOPIAN<span class="heading-dot" aria-hidden="true">.</span></h1>
    <div ref="spread" class="hero-spread">
      <NuxtLink :to="trailingPath(current.albumPath)" class="hero-main-print" :style="{ '--print-rotation': photoRotation(current.photoUrl) }" :aria-label="`View ${current.title} album`">
        <PortfolioImage :src="current.photoUrl" :alt="`${current.title} — selected photograph`" :position="current.focalPosition" eager />
        <ChekiCaption class="hero-print-title" :lines="[current.title]" aria-live="polite" aria-atomic="true" />
      </NuxtLink>
      <div class="hero-side-group">
        <div class="hero-index">
          <div class="genre-controls" role="group" aria-label="Select featured photography genre">
            <button v-for="(showcase, index) in showcases" :key="showcase.genre" type="button" :aria-pressed="selected === index" @click="selectGenre(index, $event)">{{ showcase.label }}</button>
          </div>
        </div>
        <div class="hero-side">
          <NuxtLink v-for="(photo, index) in current.supportingPhotos" :key="index" :to="trailingPath(current.albumPath)" class="hero-small-print" :style="{ '--print-rotation': photoRotation(photo.url, 5) }" :aria-label="`View ${current.title}, selected frame ${index + 2}`" :aria-describedby="index === 0 && locationLines.length ? 'hero-location-caption' : index === 1 && dateLines.length ? 'hero-date-caption' : undefined">
            <PortfolioImage :src="photo.url" :alt="`${current.title} — selected photograph ${index + 2}`" :position="photo.position" />
            <ChekiCaption v-if="index === 0 && locationLines.length" id="hero-location-caption" class="hero-mini-caption" :lines="locationLines" />
            <ChekiCaption v-if="index === 1 && dateLines.length" id="hero-date-caption" class="hero-mini-caption" :lines="dateLines" />
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="hero-caption"><a href="#latest-albums" class="text-link">Latest albums <span aria-hidden="true">↓</span></a></div>
  </section>
</template>
