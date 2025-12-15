<template>
  <div>
    <ClientOnly>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-start"
      style="grid-auto-rows: min-content;">
      <div
        v-for="(src, i) in images"
        :key="src"
        class="grid-item w-full rounded-xl overflow-hidden"
      >
        <button
        @click="openLightbox(i, $event)"
        class="block w-full cursor-pointer"
        aria-label="Open image"
        >
        <!-- use native lazy-loading so images are only requested when near viewport -->
        <img
          :src="src.replace(/\/photos\//, '/thumbnails/')"
          loading="lazy"
          decoding="async"
          :alt="`photo ${i + 1}`"
          class="block w-full h-auto object-contain hover:scale-102 transition-transform"
          @load="($event) => {
          const img = $event.target as HTMLImageElement;
          const gap = 12;
          const height = img.getBoundingClientRect().height;
          const span = Math.ceil((height + gap) / gap);
          const container = img.closest('.grid-item') as HTMLElement | null;
          if (container) container.style.gridRowEnd = 'span ' + span;
          }"
        />
        </button>
      </div>
      </div>
    </ClientOnly>

    <!-- Fly animation element + shared backdrop (painted on body so it's not clipped) -->
    <teleport to="body">
      <!-- Backdrop: present during fly animation OR when modal is open.
           It animates opacity based on fly.transitioning or when open is set. -->
      <div
        v-if="(fly && fly.visible) || open !== null"
        class="fixed inset-0 z-40"
        :class="(open !== null) ? 'pointer-events-auto' : 'pointer-events-none'"
      >
        <div
          @click="open !== null && closeLightbox()"
          class="fixed inset-0 bg-black/90 transition-opacity duration-300"
          :class="(fly && fly.transitioning) || open !== null ? 'opacity-100' : 'opacity-0'"
        />
      </div>

      <!-- Fly image above everything -->
      <div v-if="fly && fly.visible" class="fixed inset-0 z-9999 pointer-events-none">
        <img
          v-if="fly"
          :src="fly.src"
          :style="{
            position: 'fixed',
            left: fly.left + 'px',
            top: fly.top + 'px',
            width: fly.width + 'px',
            height: fly.height + 'px',
            transition: fly.transitioning ? 'left 300ms ease, top 300ms ease, width 300ms ease, height 300ms ease' : 'none'
          }"
          class="object-contain rounded-md shadow-2xl will-change-[left,top,width,height]"
          @transitionend="onFlyTransitionEnd"
          alt=""
        />
      </div>
    </teleport>

    <teleport to="body">
      <!-- Modal content (no backdrop here — the shared backdrop above handles it) -->
      <div
        v-if="open !== null"
        @click.self="closeLightbox"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="max-w-[95vw] max-h-[95vh] relative">
          <div class="relative flex items-center justify-center">
            <!-- hide the real image while the fly animation is still visible to prevent flicker -->
            <NuxtImg
              :src="images[open]"
              class="max-h-[95vh] object-contain"
              :style="{ visibility: (fly && fly.visible) ? 'hidden' : 'visible' }"
              alt=""
            />

            <button
              type="button"
              @click="closeLightbox"
              class="fixed top-3 right-3 text-white focus:outline-none rounded-full p-3 transition-transform transform shadow-lg cursor-pointer"
              aria-label="Close"
              title="Close"
            >
              <IconX class="w-5 h-5" stroke="1.5" />
            </button>

            <button
              v-if="images.length > 1"
              type="button"
              @click.stop="prevImage"
              title="Previous image"
              aria-label="Previous image"
              class="absolute 3xl:-left-12 left-3 top-1/2 -translate-y-1/2 bg-black/15 text-white hover:bg-black/30 focus:outline-none rounded-full p-3 transition-transform transform shadow-lg cursor-pointer"
            >
              <IconChevronLeft class="w-6 h-6" stroke="1.5" />
            </button>

            <button
              v-if="images.length > 1"
              type="button"
              @click.stop="nextImage"
              title="Next image"
              aria-label="Next image"
              class="absolute 3xl:-right-12 right-3 top-1/2 -translate-y-1/2 bg-black/15 text-white hover:bg-black/30 focus:outline-none rounded-full p-3 transition-transform transform shadow-lg cursor-pointer"
            >
              <IconChevronRight class="w-6 h-6" stroke="1.5" />
            </button>

            <div class="fixed bottom-3 left-1/2 -translate-x-1/2 text-white text-sm py-1">
              {{ open + 1 }} / {{ images.length }}
              <!--
              ({{ images[open]?.split('/').pop()?.split('.').slice(0, -1).join('.') }})
              -->
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-vue'

const { images } = defineProps<{
  images: string[]
}>()

const open = ref<number | null>(null)
function closeLightbox() { open.value = null }

function prevImage() {
  if (open.value === null) return
  const len = images.length
  open.value = (open.value - 1 + len) % len
}
function nextImage() {
  if (open.value === null) return
  const len = images.length
  open.value = (open.value + 1) % len
}

function onKey(e: KeyboardEvent) {
  if (open.value === null) return
  if (e.key === 'ArrowLeft') prevImage()
  else if (e.key === 'ArrowRight') nextImage()
  else if (e.key === 'Escape') closeLightbox()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

type FlyState = {
  index: number
  src: string
  left: number
  top: number
  width: number
  height: number
  transitioning: boolean
  visible: boolean
}

const fly = ref<FlyState | null>(null)

function openLightbox(i: number, e: MouseEvent) {
  const btn = e.currentTarget as HTMLElement
  const thumbImg = btn.querySelector('img') as HTMLImageElement | null
  const rect = (thumbImg ?? btn).getBoundingClientRect()

  fly.value = {
    index: i,
    src: images[i]!,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    transitioning: false,
    visible: true
  }

  const temp = new Image()
  const src = images[i]
  if (!src) return
  temp.src = src
  temp.onload = async () => {
    if (!fly.value) return
    const natW = temp.naturalWidth || rect.width
    const natH = temp.naturalHeight || rect.height
    const maxW = window.innerWidth * 0.95
    const maxH = window.innerHeight * 0.95
    const scale = Math.min(maxW / natW, maxH / natH, 1)
    const finalW = natW * scale
    const finalH = natH * scale
    const finalLeft = (window.innerWidth - finalW) / 2
    const finalTop = (window.innerHeight - finalH) / 2

    await nextTick()
    fly.value.transitioning = true
    requestAnimationFrame(() => {
      if (!fly.value) return
      fly.value.left = finalLeft
      fly.value.top = finalTop
      fly.value.width = finalW
      fly.value.height = finalH
    })
  }
}

function onFlyTransitionEnd() {
  if (!fly.value) return
  // Accept the event; different browsers may report different propertyName
  const targetIndex = fly.value.index
  // hide fly and open actual modal
  fly.value.visible = false
  fly.value.transitioning = false
  open.value = targetIndex
}
</script>
