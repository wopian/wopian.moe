<script setup lang="ts">
  const {
    title,
    date,
    location,
    cover,
    slug,
    images
  } = defineProps<{
    title: string
    date: string | string[]
    location?: string | string[]
    cover?: string
    slug: string
    images: string[]
  }>()

const isMultipleDates = Array.isArray(date);
const isMultipleLocations = Array.isArray(location);

const dateRange = isMultipleDates
  ? `${new Date(date[0] || '').toLocaleDateString()} - ${new Date(date[1] || '').toLocaleDateString()}`
  : new Date(date as string).toLocaleDateString();

const displayLocation = isMultipleLocations
  ? (location as string[]).join(', ')
  : location as string;
</script>

<template>
  <NuxtLink :to="slug" class="block group">
    <UCard variant="soft" class="overflow-hidden hover:shadow-lg transition-shadow rounded-xl">
      <div class="relative aspect-video w-full mb-4">
        <NuxtImg :src="cover || 'https://cdn.wopian.me/assets/cover.avif'" alt="cover" class="object-cover w-full h-full rounded-xl" />
      </div>

      <h2 class="text-lg font-semibold text-nowrap text-ellipsis overflow-clip">{{ title }}</h2>
      <p class="text-sm text-accent-200/75 text-nowrap text-ellipsis overflow-clip" v-if="location">{{ displayLocation }}</p>
      <div class="text-xs text-white/50 flex justify-between mt-1">
        <p>{{ dateRange }}</p>
        <p>{{ images.length }} photos</p>
      </div>
    </UCard>
  </NuxtLink>
</template>
