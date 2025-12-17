<template>
  <ImageCardGrid title="Motorsport Events" :data="data?.reverse()" />
</template>

<script setup lang="ts">
const { data = [] } = await useAsyncData('motorsport', () => {
  return queryCollection('motorsport')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})

useHead({
  title: 'Motorsport Photography by WOPIAN',
  meta: [
    {
      name: 'description',
      content: 'Explore WOPIAN\'s motorsport photography portfolio. Browse photo albums capturing the speed and excitement of motorsport.'
    }
  ]
})
</script>
