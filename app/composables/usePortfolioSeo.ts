import { trailingPath } from '~~/shared/portfolio'
export function usePortfolioSeo(title: string, description: string, image?: string) {
  const route = useRoute()
  const siteUrl = useRuntimeConfig().public.siteUrl
  const fullTitle = `${title} — WOPIAN`
  const url = computed(() => `${siteUrl}${trailingPath(route.path)}`)
  const original = image ?? 'https://cdn.wopian.me/photos/2025/DSCF0233.avif'
  useSeoMeta({
    title: fullTitle, description,
    ogTitle: fullTitle, ogDescription: description, ogType: 'website', ogSiteName: 'WOPIAN Photography',
    ogUrl: () => url.value, ogImage: original,
    twitterCard: 'summary_large_image', twitterTitle: fullTitle, twitterDescription: description,
    twitterImage: original,
  })
  useHead(() => ({ link: [{ rel: 'canonical', href: url.value }] }))
}
