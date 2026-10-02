<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
useSeoMeta({ title: 'Page not found — WOPIAN', robots: 'noindex' })
</script>
<template>
  <UApp><AppHeader /><main class="page-shell error-page"><p class="eyebrow">{{ error.statusCode }}</p><h1>{{ error.statusCode === 404 ? 'Outside the frame.' : 'A moment interrupted.' }}</h1><p>{{ error.statusCode === 404 ? 'This page could not be found. There is plenty more to explore.' : 'This page could not load. Try returning to the portfolio.' }}</p><a href="/" class="outline-link">Back to the portfolio</a></main><AppFooter /></UApp>
</template>
