<script setup lang="ts">
const { data } = await useAsyncData('motorsport-albums', () => queryCollection('motorsport').select('title', 'path', 'date', 'location', 'cover', 'images').all())
usePortfolioSeo('Motorsport photography', 'Motorsport photography by WOPIAN. Machines, events, and details worth a closer look.')
</script>
<template><ImageCardGrid type="motorsport" :data="data ?? []" /></template>
