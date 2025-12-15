<template>
  <UFooter>
    <template #left>
      © 2014–{{ String(new Date().getFullYear()).slice(-2) }} {{ site }}. All rights reserved.
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/wopian"
        target="_blank"
        aria-label="GitHub"
      />
      <UButton
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        to="https://x.com/wopian_"
        target="_blank"
        aria-label="X"
      />
      <UButton
        icon="i-simple-icons-bluesky"
        color="neutral"
        variant="ghost"
        to="https://bsky.app/profile/zeepki.st"
        target="_blank"
        aria-label="X"
      />
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const config = useRuntimeConfig()
const site = config.public.siteName ?? 'WOPIAN PHOTOGRAPHY'
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [])
</script>
