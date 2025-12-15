<template>
  <UApp>

    <UMain>
      <AppHeader />

      <NuxtLayout>
        <NuxtRouteAnnouncer />
        <UContainer class="w-full h-full max-auto px-4 sm:px-6 lg-px-8 xl-px-10 py-8 space-y-8">
          <NuxtPage />
        </UContainer>
      </NuxtLayout>
    </UMain>

    <AppFooter />
  </UApp>
</template>

<script setup lang="ts">
</script>
