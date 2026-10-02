import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const schema = z.object({
  title: z.string(),
  date: z.union([z.string(), z.array(z.string())]),
  location: z.union([z.string(), z.array(z.string())]).nullish(),
  cover: z.string().nullish(),
  images: z.array(z.string().nullable()).nullish(),
})
export default defineContentConfig({
  collections: {
    concerts: defineCollection({ type: 'page', source: 'concerts/**/*.md', schema }),
    cosplay: defineCollection({ type: 'page', source: 'cosplay/**/*.md', schema }),
    motorsport: defineCollection({ type: 'page', source: 'motorsport/**/*.md', schema }),
    other: defineCollection({ type: 'page', source: 'other/**/*.md', schema }),
  },
})
