<template>
  <h1 class="text-3xl font-semibold">{{ title }}</h1>

  <div v-if="data?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <ImageCard
      v-for="c in sortedData"
      :key="c.path"
      :title="c.title"
      :date="c.date"
      :location="('location' in c) ? c.location : undefined"
      :cover="c.cover"
      :slug="c.path"
      :images="c.images || []"
    />
  </div>

  <p v-else class="text-gray-500">No albums found.</p>
</template>

<script lang="ts" setup>
import type { ConcertsCollectionItem, CosplayCollectionItem, MotorsportCollectionItem, OtherCollectionItem } from '@nuxt/content';

const { title, data } = defineProps<{
  title: string;
  data:
    Pick<ConcertsCollectionItem | CosplayCollectionItem | OtherCollectionItem | MotorsportCollectionItem, "id" | "title" | "date" | "location" | "cover" | "images" | "path">[] |
    undefined;
}>()

const sortedData = Array.from(data ?? []).sort((a, b) => {
  const dateA = Array.isArray(a.date) ? a.date[0] : a.date
  const dateB = Array.isArray(b.date) ? b.date[0] : b.date
  return new Date(dateB ?? 0).getTime() - new Date(dateA ?? 0).getTime()
})
</script>
