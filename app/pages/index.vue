<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
import { showcases, populatedAlbums, trailingPath } from '~~/shared/portfolio'
const { data } = await useAsyncData('homepage-albums', async () => {
  const [concerts, cosplay, motorsport] = await Promise.all([
    queryCollection('concerts').select('title', 'path', 'date', 'cover', 'images', 'location').all(),
    queryCollection('cosplay').select('title', 'path', 'date', 'cover', 'images', 'location').all(),
    queryCollection('motorsport').select('title', 'path', 'date', 'cover', 'images', 'location').all(),
  ])
  return { concerts: populatedAlbums(concerts), cosplay: populatedAlbums(cosplay), motorsport: populatedAlbums(motorsport) }
})
const totalPhotos = computed(() => Object.values(data.value ?? {}).flat().reduce((count, album) => count + album.images.length, 0))
usePortfolioSeo('Concert, cosplay & motorsport photography', 'Photography by WOPIAN. Explore live music, cosplay portraits, and motorsport through selected photographs and complete event albums.')
</script>
<template>
  <div class="home-page">
    <PortfolioHero />
    <div class="page-shell">
      <section id="selected-work" class="selected-section">
        <div v-reveal class="section-heading selected-heading"><div><h2>Look a little<br><span class="muted-heading">closer.</span></h2></div><p class="section-description text-right">From the front row to another world.<br>{{ totalPhotos.toLocaleString('en-GB') }} photographs.</p></div>
        <div class="genre-grid"><NuxtLink v-for="(showcase, index) in showcases" :key="showcase.genre" v-reveal :to="trailingPath(`/${showcase.genre}`)" class="genre-tile" :style="{ '--reveal-delay': `${index * 80}ms` }"><PortfolioImage :src="showcase.photoUrl" :alt="`${showcase.label} photography by WOPIAN`" :position="showcase.focalPosition" /><div class="genre-tile-shade" /><div class="genre-tile-caption"><h3>{{ showcase.label }}</h3><p>{{ showcase.description }}</p></div><IconArrowUpRight class="genre-tile-arrow" :size="30" :stroke="1.3" /></NuxtLink></div>
      </section>
      <div class="recent-work"><LatestOfType v-for="showcase in showcases" :key="showcase.genre" :type="showcase.genre" :albums="data?.[showcase.genre] ?? []" /></div>
      <section v-reveal class="support-section"><div><h2>More moments<br>to come.</h2><p>If the photographs mean something to you, a coffee helps make the next shoot happen.</p></div><a class="outline-link" href="https://ko-fi.com/wopian" target="_blank" rel="noopener noreferrer">Support me on Ko-fi<IconArrowUpRight :size="22" :stroke="1.4" /></a></section>
    </div>
  </div>
</template>
