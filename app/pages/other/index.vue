<script setup lang="ts">
const { data } = await useAsyncData('other-albums', () => queryCollection('other').select('title', 'path', 'date', 'location', 'cover', 'images').all())
usePortfolioSeo('Other photography', 'Travel and other photography by WOPIAN. Places, people, and details outside the usual frame.')
</script>
<template><ImageCardGrid type="other" :data="data ?? []" /></template>
