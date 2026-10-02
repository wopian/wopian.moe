<script setup lang="ts">
import { IconArrowUpRight, IconArrowDown } from '@tabler/icons-vue'
import { showcases, trailingPath } from '~~/shared/portfolio'
const selected = ref(0)
const current = computed(() => showcases[selected.value]!)
</script>
<template>
  <section class="portfolio-hero" aria-labelledby="hero-title">
    <div class="hero-images" aria-hidden="true"><PortfolioImage v-for="(showcase, index) in showcases" :key="showcase.genre" :src="showcase.photoUrl" alt="" :position="showcase.focalPosition" :eager="index === 0" class="hero-photo" :class="{ 'is-active': selected === index }" /></div>
    <div class="hero-shade" />
    <div class="hero-content page-shell">
      <h1 id="hero-title">IN THE<br><span>MOMENT.</span></h1>
      <NuxtLink class="hero-album-link text-link text-right" :to="trailingPath(current.albumPath)"><span><span class="eyebrow">Featured Event</span><span class="hero-album-title">{{ current.title }}</span></span><IconArrowUpRight :size="28" :stroke="1.2" /></NuxtLink>
    </div>
    <div class="hero-bottom page-shell">
      <div class="genre-controls" role="group" aria-label="Select featured photography genre"><button v-for="(showcase, index) in showcases" :key="showcase.genre" type="button" :aria-pressed="selected === index" @click="selected = index"><span>{{ showcase.label }}</span><span class="genre-indicator" aria-hidden="true" /></button></div>
      <a href="#selected-work" class="explore-link"><span class="eyebrow">Explore my work</span><IconArrowDown :size="19" :stroke="1.5" /></a>
    </div>
  </section>
</template>
