<template>
  <UHeader :title="site" mode="modal" toggleSide="right">
    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const config = useRuntimeConfig()
const site = config.public.siteName ?? 'WOPIAN PHOTOGRAPHY'
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Software',
    to: '/software',
    active: route.path.startsWith('/software')
  },
  {
    label: 'Concerts',
    to: '/concerts',
    active: route.path.startsWith('/concerts')
  },
  {
    label: 'Cosplay',
    to: '/cosplay',
    active: route.path.startsWith('/cosplay')
  },
  {
    label: 'Motorsport',
    to: '/motorsport',
    active: route.path.startsWith('/motorsport')
  },
  {
    label: 'Other',
    to: '/other',
    active: route.path.startsWith('/other')
  }
])
</script>
