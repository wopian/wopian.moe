<template>
  <ImageCardGrid title="Concerts" :data="data?.reverse()" />
</template>

<script setup lang="ts">
const { data = [] } = await useAsyncData('concerts', () => {
  return queryCollection('concerts')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})

useHead({
  title: 'Concert Photography by WOPIAN',
  meta: [
    {
      name: 'description',
      content: 'Explore WOPIAN\'s concert photography portfolio, featuring stunning images from live music events. Browse photo albums capturing the energy and atmosphere of concerts around the world.'
    }
  ]
})
</script>
