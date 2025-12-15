<script setup lang="ts">
  const links = ref([
    {
      label: 'Support me on Ko-fi',
      to: 'https://ko-fi.com/wopian'
    }
  ])
</script>

<template>
  <LatestOfType type="concerts" title="Latest Concerts" />

  <UPageCTA
    class="rounded-xl"
    :ui="{ container: 'py-12 lg:py-12' }"
    variant="soft"
    title="Like my work?"
    description="If you enjoy my photography and want to support my work, consider buying me a coffee
      on Ko-fi!"
  >
    <template #links>
      <UButton
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        target="_blank"
        rel="noopener"
        class="px-6 py-3 bg-accent text-white rounded hover:bg-accent-200 transition"
      >
        {{ link.label }}
      </UButton>
    </template>
  </UPageCTA>

  <LatestOfType type="motorsport" title="Latest Motorsport Events" />

  <LatestOfType type="cosplay" title="Latest Cosplay Shoots" />

  <LatestOfType type="other" title="Latest Miscellaneous Photos" />
</template>
