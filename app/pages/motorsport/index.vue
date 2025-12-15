<template>
  <ImageCardGrid title="Motorsport Events" :data="data?.reverse()" />
</template>

<script setup lang="ts">
const { data = [] } = await useAsyncData('motorsport', () => {
  return queryCollection('motorsport')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})
</script>
