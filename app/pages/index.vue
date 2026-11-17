<script setup lang="ts">
import { showcases, populatedAlbums, genreDetails, trailingPath, albumTimestamp } from '~~/shared/portfolio'
import type { Genre } from '~~/shared/portfolio'
const genres: Genre[] = ['concerts', 'cosplay', 'motorsport', 'other']
const { data } = await useAsyncData('homepage-albums', async () => {
  return await Promise.all(genres.map(async genre => ({ genre, albums: populatedAlbums(await queryCollection(genre).select('title', 'path', 'date', 'cover', 'images', 'location').all()) })))
})
const latest = computed(() => (data.value ?? []).flatMap(collection => collection.albums)
  .filter(album => !showcases.some(showcase => showcase.albumPath === album.path))
  .sort((a, b) => albumTimestamp(b.date) - albumTimestamp(a.date) || a.path.localeCompare(b.path)).slice(0, 12))
function albumsFor(genre: Genre) { return data.value?.find(collection => collection.genre === genre)?.albums ?? [] }
usePortfolioSeo('Concert, cosplay & motorsport photography', 'Photography by WOPIAN. Browse photos from live music, cosplay events, motorsport, and travels.')
</script>

<template>
  <div class="home-page">
    <PortfolioHero />
    <div class="page-shell">
      <section id="latest-albums" class="latest-section">
        <div class="section-heading"><h2>Latest albums<span class="heading-dot">.</span></h2></div>
        <div class="latest-grid"><ImageCard v-for="(album, index) in latest" :key="album.path" :album="album" :index="index" /></div>
      </section>
      <PhotographySupport />
      <section id="category-index" class="category-index" aria-labelledby="category-title">
        <div class="section-heading"><h2 id="category-title">The archive</h2></div>
        <NuxtLink v-for="genre in genres" :key="genre" :to="trailingPath(`/${genre}`)" class="category-row"><h3>{{ genreDetails[genre].label }}</h3><span class="category-count">{{ albumsFor(genre).length }} {{ albumsFor(genre).length === 1 ? 'album' : 'albums' }}</span><span class="category-arrow" aria-hidden="true">↗</span></NuxtLink>
      </section>
    </div>
  </div>
</template>
