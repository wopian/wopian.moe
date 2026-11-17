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
const metadata = computed(() => [album.value.location, date.value, `${album.value.images.length} photos`].filter(Boolean))
const details = genreDetails[props.type]
usePortfolioSeo(album.value.title, `${album.value.title}. ${album.value.location}. ${date.value}. ${album.value.images.length} photos by WOPIAN.`, album.value.cover)
</script>
<template>
  <section class="album-page">
    <div class="album-intro page-shell"><NuxtLink :to="trailingPath(`/${type}`)" class="text-link back-link"><IconArrowLeft :size="17" stroke="1.5" />{{ details.label }}</NuxtLink><h1>{{ album.title }}<span class="heading-dot">.</span></h1><div class="album-meta"><span><template v-for="(part, index) in metadata" :key="index"><span v-if="index" class="album-separator" aria-hidden="true"> ⁄ </span>{{ part }}</template></span></div></div>
    <div v-if="album.cover && album.images.length" class="album-cover"><PortfolioImage :src="album.cover" :alt="album.title" eager /></div>
    <div class="page-shell album-gallery-section"><ImageGallery v-if="album.images.length" :images="album.images" :title="album.title" /><div v-else class="empty-state"><p class="eyebrow">Album pending</p><h2>No photos here yet.</h2><p>This album exists, but photos are not available yet.</p><NuxtLink :to="trailingPath(`/${type}`)" class="text-link">Explore {{ details.label.toLowerCase() }}<IconArrowUpRight :size="18" /></NuxtLink></div><PhotographySupport /></div>
  </section>
</template>
