<script setup lang="ts">
import { IconX, IconChevronLeft, IconChevronRight, IconArrowUpRight } from '@tabler/icons-vue'
import { swipeDirection } from '~~/shared/portfolio'
const props = defineProps<{ images: string[]; title: string }>()
const open = ref(false)
const selected = ref(0)
const failed = ref(false)
const trigger = shallowRef<HTMLElement | null>(null)
const current = computed(() => props.images[selected.value]!)
const touchStart = ref<{ x: number; y: number } | null>(null)
watch(selected, () => { failed.value = false })
function openLightbox(index: number, event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  trigger.value = event.currentTarget as HTMLElement
  selected.value = index
  failed.value = false
  open.value = true
}
function move(direction: number) { selected.value = (selected.value + direction + props.images.length) % props.images.length }
function onImageError(event: Event) {
  if ((event.target as HTMLImageElement).getAttribute('src') === current.value) failed.value = true
}
function onKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  move(event.key === 'ArrowLeft' ? -1 : 1)
}
function restoreFocus(event: Event) {
  event.preventDefault()
  if (trigger.value?.isConnected) trigger.value.focus({ preventScroll: true })
}
function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  touchStart.value = touch && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
}
function onTouchEnd(event: TouchEvent) {
  const touch = event.changedTouches[0]
  if (touch && touchStart.value) {
    const direction = swipeDirection(touchStart.value, { x: touch.clientX, y: touch.clientY })
    if (direction) move(direction)
  }
  touchStart.value = null
}
onBeforeUnmount(() => { open.value = false; trigger.value = null })
</script>
<template>
  <div class="image-gallery">
    <div class="photo-masonry"><a v-for="(src, index) in images" :key="`${src}-${index}`" :href="src" class="gallery-photo" :aria-label="`Open photograph ${index + 1} of ${images.length} from ${title}`" @click="openLightbox(index, $event)"><img :src="src" :alt="`${title} — photograph ${index + 1}`" loading="lazy" decoding="async" @error="($event.target as HTMLImageElement).classList.add('thumbnail-unavailable')"><span class="gallery-photo-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span></a></div>
    <UModal v-model:open="open" :title="`${title} — photograph ${selected + 1}`" description="Use left and right arrow keys or swipe to change photograph. Press Escape to close." fullscreen :close="false" :content="{ onCloseAutoFocus: restoreFocus }" :ui="{ content: 'lightbox-content', overlay: 'bg-black/95' }">
      <template #content>
        <div class="lightbox" @keydown="onKey">
          <div class="lightbox-top"><div><span class="eyebrow">{{ title }}</span><span class="lightbox-counter" aria-live="polite" aria-atomic="true">{{ selected + 1 }} / {{ images.length }}</span></div><UButton color="neutral" variant="ghost" aria-label="Close photograph" class="lightbox-button" @click="open = false"><IconX :size="25" :stroke="1.5" /></UButton></div>
          <div class="lightbox-stage" @touchstart.passive="onTouchStart" @touchend="onTouchEnd" @touchcancel="touchStart = null"><Transition name="photo" mode="out-in"><div :key="current" class="lightbox-frame"><img v-if="!failed" :src="current" :alt="`${title} — photograph ${selected + 1}`" decoding="async" @error="onImageError"><div v-else class="lightbox-error"><h2>Photograph unavailable</h2><p>Try another photograph or open the original.</p></div></div></Transition></div>
          <div class="lightbox-bottom"><UButton color="neutral" variant="ghost" aria-label="Previous photograph" class="lightbox-button" :disabled="images.length < 2" @click="move(-1)"><IconChevronLeft :size="23" :stroke="1.5" /><span>Previous</span></UButton><a :href="current" target="_blank" rel="noopener noreferrer" class="text-link">Open original<IconArrowUpRight :size="16" /></a><UButton color="neutral" variant="ghost" aria-label="Next photograph" class="lightbox-button" :disabled="images.length < 2" @click="move(1)"><span>Next</span><IconChevronRight :size="23" :stroke="1.5" /></UButton></div>
        </div>
      </template>
    </UModal>
  </div>
</template>
