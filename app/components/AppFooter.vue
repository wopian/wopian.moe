<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
const year = new Date().getUTCFullYear()
const links = [
  { label: 'Bluesky', href: 'https://bsky.app/profile/zeepki.st' },
  { label: 'X', href: 'https://x.com/wopian_' },
  { label: 'GitHub', href: 'https://github.com/wopian' },
]
</script>
<template>
  <footer class="site-footer page-shell">
    <div class="footer-top"><NuxtLink class="wordmark footer-wordmark" to="/">WOPIAN<span class="brand-dot rounded-4xl" aria-hidden="true" /></NuxtLink><p>Concerts. Cosplay. Motorsport.<br>Photographs from inside the moment.</p><a class="text-link" href="https://ko-fi.com/wopian" target="_blank" rel="noopener noreferrer">Support the next shoot <IconArrowUpRight :size="18" /></a></div>
    <div class="footer-bottom"><span>© 2014–{{ year }} WOPIAN. All rights reserved.</span><nav aria-label="More work"><NuxtLink to="/other/">Other photography</NuxtLink><NuxtLink to="/software/">Software</NuxtLink></nav><nav aria-label="Social links"><a v-for="link in links" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}<IconArrowUpRight :size="13" /></a></nav></div>
  </footer>
</template>
