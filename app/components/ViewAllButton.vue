<template>
  <UButton
    :to="to"
    variant="solid"
    color="accent"
    size="lg"
  >
    View All
  </UButton>
</template>

<script lang="ts" setup>
const { to } = defineProps<{
  to: string;
}>()
</script>
