<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
import { genreDetails, populatedAlbums, trailingPath } from '~~/shared/portfolio'
import type { Genre, AlbumSource } from '~~/shared/portfolio'
const props = defineProps<{ type: Genre; albums: AlbumSource[] }>()
const items = computed(() => populatedAlbums(props.albums).slice(0, 3))
const details = computed(() => genreDetails[props.type])
</script>
<template>
  <section v-if="items.length" class="latest-section">
    <div v-reveal class="section-heading"><div><h2>{{ details.label }}<span class="heading-dot">.</span></h2></div><NuxtLink :to="trailingPath(`/${type}`)" class="text-link">All {{ details.label.toLowerCase() }}<IconArrowUpRight :size="19" :stroke="1.5" /></NuxtLink></div>
    <div class="latest-grid" :class="{ 'single-album': items.length === 1 }"><ImageCard v-for="(album, index) in items" :key="album.path" :album="album" :index="index" /></div>
  </section>
</template>
