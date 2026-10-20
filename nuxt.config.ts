import { fileURLToPath } from 'node:url'
import { albumRoutes } from './scripts/album-routes'

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-10-02',
  modules: ['@nuxt/content', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  devServer: { port: 4002 },
  typescript: { strict: true },
  // Preload dependency changes must change chunk URLs for immutable caching.
  experimental: { entryImportMap: false },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content',
      meta: [
        { name: 'theme-color', content: '#0b0b0d' },
        { name: 'color-scheme', content: 'dark' },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: await albumRoutes(fileURLToPath(new URL('./content', import.meta.url))),
      crawlLinks: true, autoSubfolderIndex: true, failOnError: true, concurrency: 4,
    },
  },
  content: { experimental: { sqliteConnector: 'bun' } },
  icon: { clientBundle: { icons: ['lucide:menu', 'lucide:x', 'lucide:chevron-down', 'lucide:check', 'lucide:arrow-up-right'] } },
  colorMode: { preference: 'dark', fallback: 'dark' },
  ui: { fonts: false, theme: { colors: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] } },
  runtimeConfig: { public: { siteName: 'WOPIAN', siteUrl: 'https://wopian.me' } },
})
