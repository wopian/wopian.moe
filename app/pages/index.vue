<script setup lang="ts">
const config = useRuntimeConfig()
const site = config.public.siteName ?? 'WOPIAN PHOTOGRAPHY'

const links = ref([
  {
    label: 'Support me on Ko-fi',
    to: 'https://ko-fi.com/wopian'
  }
])

useHead({
  title: site,
  meta: [
    {
      name: 'description',
      content: 'Professional concert, motorsport and cosplay photography by WOPIAN. Explore stunning photo albums and high-quality images from various events.'
    }
  ]
})
</script>

<template>
  <LatestOfType type="concerts" title="Latest Concerts" />

  <UPageCTA
    class="rounded-xl"
    :ui="{ container: 'py-12 lg:py-12' }"
    variant="soft"
    title="Enjoy the photos?"
    description="Help support future shoots, travel and editing by buying me a coffee on Ko-fi. Every contribution is greatly appreciated."
  >
    <template #links>
      <UButton
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        target="_blank"
        rel="noopener"
        variant="solid"
			  color="accent"
			  size="xl"
      >
        {{ link.label }}
      </UButton>
    </template>
  </UPageCTA>

  <LatestOfType type="cosplay" title="Latest Cosplay Shoots" />

  <LatestOfType type="motorsport" title="Latest Motorsport Events" />

  <LatestOfType type="other" title="Latest Miscellaneous Photos" />
</template>
