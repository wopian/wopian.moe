<template>
  <ImageCardGrid title="Cosplay Shoots" :data="data" />
</template>

<script setup lang="ts">
const { data } = await useAsyncData('cosplay', () => {
  return queryCollection('cosplay')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})
</script>
