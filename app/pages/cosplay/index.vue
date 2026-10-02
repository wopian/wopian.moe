<script setup lang="ts">
const { data } = await useAsyncData('cosplay-albums', () => queryCollection('cosplay').select('title', 'path', 'date', 'location', 'cover', 'images').all())
usePortfolioSeo('Cosplay photography', 'Cosplay photography by WOPIAN. Portraits, conventions, and stories brought to life.')
</script>
<template><ImageCardGrid type="cosplay" :data="data ?? []" /></template>
