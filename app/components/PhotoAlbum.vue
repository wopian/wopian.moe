<script setup lang="ts">
import { IconArrowLeft, IconArrowUpRight } from '@tabler/icons-vue'
import { formatAlbumDate, genreDetails, normalizeAlbum, trailingPath } from '~~/shared/portfolio'
import type { Genre } from '~~/shared/portfolio'
const props = defineProps<{ type: Genre; slug: string }>()
const path = `/${props.type}/${props.slug}`
const { data, error } = await useAsyncData(`album-${path}`, async () => {
  const content = await queryCollection(props.type).path(path).first()
  if (!content) throw createError({ statusCode: 404, statusMessage: 'Album not found' })
  return normalizeAlbum(content)
})
if (error.value) throw createError(error.value)
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Album not found' })
const album = computed(() => data.value!)
const date = computed(() => formatAlbumDate(album.value.date))
const details = genreDetails[props.type]
usePortfolioSeo(album.value.title, `${album.value.title}. ${album.value.location}. ${date.value}. ${album.value.images.length} photographs by WOPIAN.`, album.value.cover)
</script>
<template>
  <section class="album-page">
    <div class="album-intro page-shell"><NuxtLink :to="trailingPath(`/${type}`)" class="text-link back-link"><IconArrowLeft :size="17" :stroke="1.5" />{{ details.label }}</NuxtLink><p class="eyebrow">{{ date }}</p><h1>{{ album.title }}</h1><div class="album-meta"><span v-if="album.location">{{ album.location }}</span><span>{{ album.images.length }} photographs</span></div></div>
    <div v-if="album.cover && album.images.length" class="album-cover"><PortfolioImage :src="album.cover" :alt="album.title" eager /></div>
    <div class="page-shell album-gallery-section"><div v-if="album.images.length" class="section-heading gallery-heading"><p class="eyebrow">All Photos</p><span class="gallery-hint">Select a photograph to look closer<IconArrowUpRight :size="16" /></span></div><ImageGallery v-if="album.images.length" :images="album.images" :title="album.title" /><div v-else class="empty-state"><p class="eyebrow">Still developing</p><h2>Photographs are on their way.</h2><p>This album exists, but photographs are not available yet.</p><NuxtLink :to="trailingPath(`/${type}`)" class="text-link">Explore {{ details.label.toLowerCase() }}<IconArrowUpRight :size="18" /></NuxtLink></div></div>
  </section>
</template>
