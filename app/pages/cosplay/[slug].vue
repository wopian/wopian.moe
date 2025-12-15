<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug as string
</script>

<template>
  <PhotoAlbum type="cosplay" :slug="slug" />
</template>
