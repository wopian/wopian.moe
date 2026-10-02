<script setup lang="ts">
const { data } = await useAsyncData('concerts-albums', () => queryCollection('concerts').select('title', 'path', 'date', 'location', 'cover', 'images').all())
usePortfolioSeo('Concerts photography', 'Live music photography by WOPIAN. Explore complete albums from gigs, festivals, and tours.')
</script>
<template><ImageCardGrid type="concerts" :data="data ?? []" /></template>
