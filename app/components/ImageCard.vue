<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
import { formatAlbumDate, normalizeAlbum, trailingPath } from '~~/shared/portfolio'
import type { AlbumSource } from '~~/shared/portfolio'
const props = defineProps<{ album: AlbumSource; index?: number }>()
const item = computed(() => normalizeAlbum(props.album))
</script>
<template>
  <article v-reveal class="album-card" :style="{ '--reveal-delay': `${Math.min(index ?? 0, 2) * 80}ms` }">
    <NuxtLink :to="trailingPath(item.path)" class="album-card-link">
      <div class="album-card-photo"><PortfolioImage v-if="item.cover" :src="item.cover" :alt="item.title" /><span class="photo-count">{{ item.images.length }} photographs</span><span class="card-open" aria-hidden="true"><IconArrowUpRight :size="26" :stroke="1.4" /></span></div>
      <div class="album-card-caption"><span class="eyebrow">{{ formatAlbumDate(item.date) }}</span><h3>{{ item.title }}</h3><p v-if="item.location">{{ item.location }}</p></div>
    </NuxtLink>
  </article>
</template>
