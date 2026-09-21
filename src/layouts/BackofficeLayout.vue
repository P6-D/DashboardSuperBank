<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'

/** FRD §6.2 AppShell layout skeleton. */
const route = useRoute()
const auth = useAuthStore()
const notifications = useNotificationStore()

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '')

if (auth.sessionNotice) {
  notifications.warning('Session ended', auth.sessionNotice)
  auth.clearSessionNotice()
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--color-surface-0)]">
    <Sidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <Topbar />
      <main class="flex-1 overflow-y-auto px-6 py-6">
        <p class="mb-1 text-xs text-[var(--color-text-muted)]">Backoffice / {{ pageTitle }}</p>
        <h1 class="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">{{ pageTitle }}</h1>
        <RouterView />
      </main>
    </div>
    <ToastHost />
  </div>
</template>
