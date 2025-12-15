<template>
  <ImageCardGrid title="Concerts" :data="data?.reverse()" />
</template>

<script setup lang="ts">
const { data = [] } = await useAsyncData('concerts', () => {
  return queryCollection('concerts')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})
</script>
