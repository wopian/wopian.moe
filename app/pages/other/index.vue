<template>
  <ImageCardGrid title="Miscellaneous Photos" :data="data?.reverse()" />
</template>

<script setup lang="ts">
const { data = [] } = await useAsyncData('other', () => {
  return queryCollection('other')
    .select('id', 'path', 'title', 'date', 'location', 'cover', 'images')
    .all()
})

useHead({
  title: 'Miscellaneous Photography by WOPIAN',
  meta: [
    {
      name: 'description',
      content: 'Various photography works by WOPIAN that do not fit into specific categories.'
    }
  ]
})
</script>
