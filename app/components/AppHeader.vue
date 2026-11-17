<script setup lang="ts">
import { IconMenu2, IconX, IconArrowUpRight } from '@tabler/icons-vue'
import { showcases, trailingPath } from '~~/shared/portfolio'
const route = useRoute()
const mastheadVisible = useState('homepage-masthead-visible', () => true)
const hideWordmark = computed(() => route.path === '/' && mastheadVisible.value)
watch(() => route.path, path => { if (path === '/') mastheadVisible.value = true })
const navigationLinks = [...showcases.map(item => ({ label: item.label, to: `/${item.genre}` })), { label: 'Other', to: '/other' }, { label: 'Software', to: '/software' }]
// Browsers parse noscript as text when JavaScript runs. Avoid hydrating its children.
const fallbackNavigation = `<nav class="noscript-nav" aria-label="Navigation without JavaScript">${navigationLinks.map(link => `<a href="${trailingPath(link.to)}">${link.label}</a>`).join('')}</nav>`
</script>
<template>
  <UHeader class="site-header" :class="{ 'is-homepage': route.path === '/' }" mode="slideover" :ui="{ container: 'header-inner', center: 'justify-center', right: 'gap-5', content: 'mobile-menu-content', body: 'mobile-menu-body' }" :menu="{ title: 'Explore WOPIAN', description: 'Photography and other work' }">
    <template #left><NuxtLink to="/" aria-label="WOPIAN home" class="wordmark header-wordmark" :class="{ 'is-hidden': hideWordmark }" :inert="hideWordmark" :aria-hidden="hideWordmark ? 'true' : undefined" :tabindex="hideWordmark ? -1 : undefined"><span>WOPIAN<span class="heading-dot" aria-hidden="true">.</span></span></NuxtLink></template>
    <nav class="primary-nav" aria-label="Main navigation">
      <NuxtLink v-for="link in navigationLinks" :key="link.to" :to="trailingPath(link.to)" :aria-current="route.path.startsWith(link.to) ? 'page' : undefined" class="nav-link">{{ link.label }}</NuxtLink>
    </nav>
    <template #toggle="{ open, toggle }"><UButton color="neutral" variant="ghost" :aria-label="open ? 'Close navigation' : 'Open navigation'" class="mobile-toggle" @click="toggle"><IconX v-if="open" :size="24" stroke="1.5" /><IconMenu2 v-else :size="24" stroke="1.5" /></UButton></template>
    <template #body><nav class="mobile-nav" aria-label="Main navigation"><NuxtLink v-for="link in navigationLinks" :key="link.to" :to="trailingPath(link.to)">{{ link.label }}<IconArrowUpRight :size="24" stroke="1.5" /></NuxtLink></nav></template>
  </UHeader>
  <noscript v-html="fallbackNavigation" />
</template>
