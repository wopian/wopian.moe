<script setup lang="ts">
const props = withDefaults(defineProps<{ src: string; alt: string; eager?: boolean; position?: string }>(), { eager: false, position: '50% 50%' })
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
<template>
  <div class="portfolio-image" :class="{ 'image-unavailable': failed }">
    <img v-if="!failed" :src="src" :alt="alt" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" decoding="async" :style="{ objectPosition: position }" @error="failed = true">
    <span v-else class="image-error">Photograph unavailable</span>
  </div>
</template>
