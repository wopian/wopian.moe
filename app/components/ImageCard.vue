<script setup lang="ts">
import { formatAlbumDate, normalizeAlbum, trailingPath } from '~~/shared/portfolio'
import type { AlbumSource } from '~~/shared/portfolio'
const props = defineProps<{ album: AlbumSource; index?: number }>()
const item = computed(() => normalizeAlbum(props.album))
const metadata = computed(() => [item.value.location, formatAlbumDate(item.value.date)].filter(Boolean))
const previews = computed(() => [...new Set(item.value.images)].filter(src => src !== item.value.cover).slice(0, 2))
</script>

<template>
  <article class="album-card">
    <NuxtLink :to="trailingPath(item.path)" class="album-card-link">
      <div class="album-card-stack">
        <PortfolioImage v-for="(src, position) in previews" :key="src" :src="src" alt="" class="stack-preview" :class="`stack-preview-${position + 1}`" aria-hidden="true" />
        <div class="album-card-photo"><PortfolioImage v-if="item.cover" :src="item.cover" :alt="item.title" /><span class="photo-count">{{ item.images.length }} photos</span></div>
      </div>
      <div class="album-card-caption"><h3>{{ item.title }}</h3><p v-if="metadata.length"><template v-for="(part, index) in metadata" :key="index"><span v-if="index" class="album-separator" aria-hidden="true"> ⁄ </span>{{ part }}</template></p></div>
    </NuxtLink>
  </article>
</template>
