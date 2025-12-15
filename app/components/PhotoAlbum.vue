<template>
  <div v-if="data" class="space-y-6">
    <!-- Hero -->
    <div class="relative w-full aspect-16/3 rounded overflow-hidden shadow-md">
      <NuxtImg
        :src="data.cover || 'https://cdn.wopian.me/assets/cover.avif'"
        alt="cover"
        class="object-cover w-full h-full rounded-xl blur-xs"
      />
      <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      <div class="absolute bottom-4 left-4 text-white space-y-2">
        <h1 class="text-4xl font-bold">{{ data.title }}</h1>
        <p class="text-sm" v-if="data.location">
          {{ displayLocation }}
        </p>
        <p class="text-sm">
          {{ dateRange }}
        </p>
      </div>
    </div>

    <!-- Gallery -->
    <div v-if="images?.length">
      <h2 class="text-2xl font-semibold mb-3">Gallery</h2>
      <ImageGallery :images="images" :cover="data.cover" />
    </div>

    <UEmpty
      v-else
      title="No images found"
      description="It looks like there are no images available for this album."
      icon="i-lucide-image-off"
    />
  </div>

  <UEmpty
    v-else
    title="Album not found"
    description="The requested photo album could not be found."
    icon="i-lucide-folder-search"
  />
</template>

<script lang="ts" setup>
const {
  type,
  slug
} = defineProps<{
  type: "concerts" | "cosplay" | "other" | "motorsport";
  slug: string
}>()

const { data } = await useAsyncData(`${type}-${slug}`, async () => {
  const content = await queryCollection(type)
    .where('path', '=', `/${type}/${slug}`)
    .first()

  if (!content) {
    throw createError({ statusCode: 404, statusMessage: 'Album not found' })
  }

  return content
})

const isValidImage = (item: any) => {
  try {
    new URL(item)
    return true
  } catch {
    return false
  }
}

const images = computed(() => {
  return data.value?.images?.filter((img: any) => img && isValidImage(img)) || []
})

const { date, location } = data.value || {};
const isMultipleDates = Array.isArray(date);
const isMultipleLocations = Array.isArray(location);

const dateRange = isMultipleDates
  ? `${new Date(date[0] || '').toLocaleDateString()} - ${new Date(date[1] || '').toLocaleDateString()}`
  : new Date(date as string).toLocaleDateString();

const displayLocation = isMultipleLocations
  ? (location as string[]).join(', ')
  : location as string;
</script>
