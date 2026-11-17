<script setup lang="ts">
import { genreDetails, populatedAlbums, showcases, albumYears, filterAlbums } from '~~/shared/portfolio'
import type { Genre, AlbumSource } from '~~/shared/portfolio'
const props = defineProps<{ type: Genre; data?: AlbumSource[] }>()
const search = ref('')
const year = ref('')
const enhanced = ref(false)
const albums = computed(() => populatedAlbums(props.data ?? []))
const years = computed(() => [...new Set(albums.value.flatMap(album => albumYears(album.date)))].sort().reverse())
const filtered = computed(() => filterAlbums(albums.value, search.value, year.value))
const details = computed(() => genreDetails[props.type])
const cover = computed(() => showcases.find(item => item.genre === props.type))
const count = computed(() => albums.value.reduce((total, album) => total + album.images.length, 0))
function reset() { search.value = ''; year.value = '' }
onMounted(() => { enhanced.value = true })
</script>

<template>
  <section class="archive-page page-shell">
    <div class="archive-intro"><div><h1>{{ details.label }}<span class="heading-dot">.</span></h1><div class="archive-stat"><span>{{ albums.length }} {{ albums.length === 1 ? 'album' : 'albums' }}</span><span>{{ count.toLocaleString('en-GB') }} photos</span></div></div><div v-if="cover" class="archive-cover"><PortfolioImage :src="cover.photoUrl" :alt="`${details.label} photography`" :position="cover.focalPosition" eager /></div></div>
    <form v-if="enhanced && albums.length" class="archive-filters" role="search" @submit.prevent>
      <label class="search-field"><span class="eyebrow">Find an album</span><input v-model="search" type="search" placeholder="Event or location" autocomplete="off" /></label>
      <label class="year-field"><span class="eyebrow">Year</span><select v-model="year"><option value="">All years</option><option v-for="option in years" :key="option" :value="option">{{ option }}</option></select></label>
      <button v-if="search || year" type="button" class="text-link clear-filters" @click="reset">Clear filters</button>
      <p class="filter-count" role="status">{{ filtered.length }} {{ filtered.length === 1 ? 'album' : 'albums' }}</p>
    </form>
    <div v-if="filtered.length" class="archive-grid"><ImageCard v-for="(album, index) in filtered" :key="album.path" :album="album" :index="index" /></div>
    <div v-else-if="albums.length" class="empty-state"><p class="eyebrow">No matches</p><h2>No albums found.</h2><p>Try another event, location, or year.</p><button type="button" class="outline-link" @click="reset">Clear filters</button></div>
    <div v-else class="empty-state"><p class="eyebrow">The archive</p><h2>No photos here yet.</h2><p>Albums will appear when photos are ready.</p><NuxtLink to="/" class="text-link">Explore photography</NuxtLink></div>
    <PhotographySupport />
  </section>
</template>
