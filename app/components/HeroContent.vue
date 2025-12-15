<script setup lang="ts">
defineProps<{ title?: string; subtitle?: string; cover?: string }>()
</script>

<template>
  <section class="rounded-xl overflow-hidden shadow-sm mb-8">
    <div class="relative aspect-16/6">
      <NuxtImg v-if="cover" :src="cover" alt="Hero" class="object-cover w-full h-full" />
      <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      <div class="absolute inset-0 flex flex-col justify-end p-6">
        <h1 class="text-4xl font-bold text-white leading-tight">{{ title }}</h1>
        <p class="text-sm text-white/90 mt-1">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>
