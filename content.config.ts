import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const schema = z.object({
  title: z.string(),
  date: z.string().or(z.array(z.string())),
  location: z.string().or(z.array(z.string())).optional(),
  cover: z.string().optional(),
  images: z.array(z.string()).optional(),
  path: z.string(),
});

export default defineContentConfig({
  collections: {
    concerts: defineCollection({
      type: 'content',
      source: 'concerts/**/*.md',
      schema,
    }),
    cosplay: defineCollection({
      type: 'content',
      source: 'cosplay/**/*.md',
      schema,
    }),
    motorsport: defineCollection({
      type: 'content',
      source: 'motorsport/**/*.md',
      schema,
    }),
    other: defineCollection({
      type: 'content',
      source: 'other/**/*.md',
      schema,
    }),
  },
})
