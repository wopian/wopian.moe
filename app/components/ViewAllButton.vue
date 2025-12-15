<template>
  <NuxtLink
    :to="to"
    class="px-6 py-1.5 bg-accent text-white rounded hover:bg-accent-200 transition"
  >
    View All
  </NuxtLink>
</template>

<script lang="ts" setup>
const { to } = defineProps<{
  to: string;
}>()
</script>
