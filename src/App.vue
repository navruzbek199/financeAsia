<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<template>
  <div id="app">
    <AppHeader v-if="authStore.isAuthenticated" />
    <main :class="{ 'with-header': authStore.isAuthenticated }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

main {
  min-height: 100vh;
  padding: 2rem;
}

main.with-header {
  padding-top: 6rem;
  min-height: calc(100vh - 4rem);
}

@media (max-width: 768px) {
  main {
    padding: 1rem;
  }
  
  main.with-header {
    padding-top: 5rem;
  }
}
</style>