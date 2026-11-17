<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
const year = new Date().getUTCFullYear()
const links = [
  { label: 'Twitter', href: 'https://x.com/wopian_' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/zeepki.st' },
  { label: 'GitHub', href: 'https://github.com/wopian' },
  { label: 'ZeepCentraal', href: 'https://zeepki.st/user/76561198031919228' },
]
</script>
<template>
  <footer class="site-footer page-shell">
    <div class="footer-bottom"><span>© 2014–{{ year }} WOPIAN. All rights reserved.</span><nav aria-label="Social links"><a v-for="link in links" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}<IconArrowUpRight :size="13" /></a></nav></div>
  </footer>
</template>
