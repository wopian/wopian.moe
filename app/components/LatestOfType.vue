<script setup lang="ts">
  const { type, title } = defineProps<{
    type: "concerts"|"cosplay"|"other"|"motorsport";
    title: string
  }>()

type LatestItem = {
  id: string;
  path: string;
  title: string;
  date: string | string[];
  cover?: any;
  images?: any[];
  location?: string | string[];
}

const sortByDateDesc = (a: LatestItem, b: LatestItem) => {
  const dateA = Array.isArray(a.date) ? a.date[0] : a.date
  const dateB = Array.isArray(b.date) ? b.date[0] : b.date

  return new Date(dateB ?? 0).getTime() - new Date(dateA ?? 0).getTime()
}

const { data } = await useAsyncData<LatestItem[]>(`latest-${type}`, async () => {
  if (type === 'concerts') {
    const concerts = await queryCollection(type)
      .select('title', 'id', 'date', 'cover', 'images', 'path', 'location')
      .all()
    return concerts
      .sort(sortByDateDesc)
      .slice(0, 3)
  } else if (type === 'cosplay') {
    const cosplays = await queryCollection(type)
      .select('title', 'id', 'date', 'cover', 'images', 'path', 'location')
      .all()
    return cosplays
      .sort(sortByDateDesc)
      .slice(0, 3)
  } else if (type === 'other') {
    const others = await queryCollection(type)
      .select('title', 'id', 'date', 'cover', 'images', 'path', 'location')
      .all()
    return others
      .sort(sortByDateDesc)
      .slice(0, 3)
  } else if (type === 'motorsport') {
    const motorsports = await queryCollection(type)
      .select('title', 'id', 'date', 'cover', 'images', 'path', 'location')
      .all()
    return motorsports
      .sort(sortByDateDesc)
      .slice(0, 3)
  } else {
    return [] as LatestItem[]
  }
})
</script>

<template>
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-semibold">{{ title }}</h2>
      <ViewAllButton :to="`/${type}`" />
    </div>

    <div v-if="data?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ImageCard
        v-for="c in data"
        :key="c.id"
        :title="c.title"
        :date="c.date"
        :location="c.location"
        :cover="c.cover"
        :slug="c.path"
        :images="c.images || []"
      />
    </div>

    <p v-else class="text-gray-500">No albums found</p>
</template>
