<template>
  <ImageCardGrid title="Cosplay Shoots" :data="data" />
</template>

<script setup lang="ts">
const { data } = await useAsyncData('cosplay', () => {
  return queryCollection('cosplay')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})

useHead({
  title: 'Cosplay Photography by WOPIAN',
  meta: [
    {
      name: 'description',
      content: 'Discover WOPIAN\'s cosplay photography portfolio, showcasing vibrant and creative costumes from various cosplay events. Explore stunning photo albums capturing the artistry and passion of the cosplay community.'
    }
  ]
})
</script>
