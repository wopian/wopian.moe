// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'bun',
    node: true,
    noExternals: true,
    inlineDynamicImports: true,
    serveStatic: 'inline',
    esbuild: {
      options: {
        target: 'esnext',
      }
    }
  },
  typescript: {
    strict: true,
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
  ],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  css: [
    '@/assets/css/main.css'
  ],
  image: {
    // TODO: Switch to CDN
    dir: 'public'
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'accent',
        'info',
        'success',
        'warning',
        'error'
      ]
    }
  },
  runtimeConfig: {
    public: {
      siteName: 'WOPIAN',
    }
  }
})
