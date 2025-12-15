<script setup lang="ts">
import type { PropType } from 'vue'
const props = defineProps({
  images: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  columns: {
    type: Number,
    default: 3
  }
})
</script>

<template>
  <div>
    <div :class="`grid gap-3`" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }">
      <div v-for="(img, i) in images" :key="img + i" class="overflow-hidden rounded-md">
        <NuxtImg :src="img" :alt="`photo-${i+1}`" class="object-cover w-full h-64" />
      </div>
    </div>
  </div>
</template>
