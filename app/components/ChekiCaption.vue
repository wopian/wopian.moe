<script setup lang="ts">
const props = withDefaults(defineProps<{ lines: string[]; maximum?: number }>(), { maximum: 72 })
const container = ref<HTMLElement | null>(null)
const text = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined
function fit() {
  if (!container.value || !text.value || !container.value.clientWidth || !container.value.clientHeight) return
  const availableHeight = container.value.clientHeight * 0.72
  const maximum = Math.min(props.maximum, availableHeight / Math.max(1, props.lines.length))
  text.value.style.fontSize = `${maximum}px`
  const size = Math.min(maximum,
    maximum * (container.value.clientWidth - 2) / Math.max(1, text.value.scrollWidth),
    maximum * availableHeight / Math.max(1, text.value.scrollHeight))
  text.value.style.fontSize = `${Math.floor(size * 100) / 100}px`
}
watch(() => [props.lines, props.maximum], fit, { flush: 'post' })
onMounted(() => {
  fit()
  observer = new ResizeObserver(fit)
  if (container.value) observer.observe(container.value)
})
onBeforeUnmount(() => { observer?.disconnect() })
</script>

<template>
  <span ref="container" class="cheki-caption" :style="{ '--caption-lines': Math.max(1, lines.length), '--caption-longest': Math.max(1, ...lines.map(line => line.length)), '--caption-maximum': `${maximum}px` }"><span ref="text" class="cheki-caption-text"><span v-for="(line, index) in lines" :key="index">{{ line }}</span></span></span>
</template>
