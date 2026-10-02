<script setup lang="ts">
import { genreDetails, populatedAlbums, showcases } from '~~/shared/portfolio'
import type { Genre, AlbumSource } from '~~/shared/portfolio'
const props = defineProps<{ type: Genre; data?: AlbumSource[] }>()
const albums = computed(() => populatedAlbums(props.data ?? []))
const details = computed(() => genreDetails[props.type])
const cover = computed(() => showcases.find(item => item.genre === props.type))
const count = computed(() => albums.value.reduce((total, album) => total + album.images.length, 0))
</script>
<template>
  <section class="archive-page page-shell">
    <div class="archive-intro"><div v-reveal><h1>{{ details.heading }}</h1><p class="archive-description">{{ details.description }}</p><div class="archive-stat"><span>{{ albums.length }} {{ albums.length === 1 ? 'album' : 'albums' }}</span><span>{{ count.toLocaleString('en-GB') }} photographs</span></div></div><div v-if="cover" class="archive-cover"><PortfolioImage :src="cover.photoUrl" :alt="`${details.label} photography`" :position="cover.focalPosition" eager /></div></div>
    <div v-if="albums.length" class="archive-grid"><ImageCard v-for="(album, index) in albums" :key="album.path" :album="album" :index="index % 3" /></div>
    <div v-else class="empty-state"><span class="eyebrow">Still developing</span><h2>More photographs to come.</h2><p>New albums will appear here when photographs are ready.</p><NuxtLink to="/" class="text-link">Explore selected work</NuxtLink></div>
  </section>
</template>
