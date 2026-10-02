<script setup lang="ts">
import { IconMenu2, IconX, IconArrowUpRight } from '@tabler/icons-vue'
import { showcases, trailingPath } from '~~/shared/portfolio'
const route = useRoute()
const primaryLinks = showcases.map(item => ({ label: item.label, to: `/${item.genre}` }))
const secondaryLinks = [{ label: 'Other', to: '/other' }, { label: 'Software', to: '/software' }]
// Browsers parse noscript as text when JavaScript runs. Avoid hydrating its children.
const fallbackNavigation = `<nav class="noscript-nav" aria-label="Navigation without JavaScript">${[...primaryLinks, ...secondaryLinks].map(link => `<a href="${trailingPath(link.to)}">${link.label}</a>`).join('')}</nav>`
</script>
<template>
  <UHeader class="site-header" mode="slideover" :ui="{ container: 'header-inner', center: 'flex-1', right: 'gap-5' }" :menu="{ title: 'Explore WOPIAN', description: 'Photography and other work' }">
    <template #title><span class="wordmark">WOPIAN<span class="brand-dot rounded-4xl" aria-hidden="true" /></span></template>
    <nav class="primary-nav" aria-label="Photography">
      <NuxtLink v-for="link in primaryLinks" :key="link.to" :to="trailingPath(link.to)" :aria-current="route.path.startsWith(link.to) ? 'page' : undefined" class="nav-link">{{ link.label }}</NuxtLink>
    </nav>
    <template #right><nav class="secondary-nav" aria-label="Other work"><NuxtLink v-for="link in secondaryLinks" :key="link.to" :to="trailingPath(link.to)" :aria-current="route.path.startsWith(link.to) ? 'page' : undefined">{{ link.label }}</NuxtLink></nav></template>
    <template #toggle="{ open, toggle }"><UButton color="neutral" variant="ghost" :aria-label="open ? 'Close navigation' : 'Open navigation'" class="mobile-toggle" @click="toggle"><IconX v-if="open" :size="24" :stroke="1.5" /><IconMenu2 v-else :size="24" :stroke="1.5" /></UButton></template>
    <template #body><nav class="mobile-nav" aria-label="Main navigation"><NuxtLink v-for="(link, index) in [...primaryLinks, ...secondaryLinks]" :key="link.to" :to="trailingPath(link.to)"><span class="eyebrow">0{{ index + 1 }}</span>{{ link.label }}<IconArrowUpRight :size="24" :stroke="1.5" /></NuxtLink></nav></template>
  </UHeader>
  <noscript v-html="fallbackNavigation" />
</template>
