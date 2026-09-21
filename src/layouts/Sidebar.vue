<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { navGroups } from './navigation'
import { usePermissionStore } from '@/stores/permission.store'
import { useUiStore } from '@/stores/ui.store'

const permissions = usePermissionStore()
const ui = useUiStore()
</script>

<template>
  <aside
    class="flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] transition-[width] duration-200"
    :class="ui.sidebarCollapsed ? 'w-16' : 'w-64'"
  >
    <nav class="flex-1 overflow-y-auto px-2 py-4" aria-label="Primary">
      <div v-for="group in navGroups" :key="group.label" class="mb-5">
        <p
          v-if="!ui.sidebarCollapsed"
          class="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
        >
          {{ group.label }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in group.items.filter((i) => permissions.can(i.permission))" :key="item.routeName">
            <RouterLink
              :to="{ name: item.routeName }"
              class="focus-ring group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
              active-class="!bg-[var(--color-surface-3)] !text-[var(--color-text-primary)]"
              :title="ui.sidebarCollapsed ? item.label : undefined"
            >
              <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40 group-hover:opacity-100" />
              <span v-if="!ui.sidebarCollapsed" class="truncate">{{ item.label }}</span>
              <span
                v-if="!ui.sidebarCollapsed && item.unavailable"
                class="ml-auto rounded bg-[var(--color-neutral-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]"
              >
                N/A
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <button
      class="focus-ring m-2 flex items-center justify-center rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
      :aria-label="ui.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="ui.toggleSidebar"
    >
      <svg
        class="h-4 w-4"
        :class="{ 'rotate-180': ui.sidebarCollapsed }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
    </button>
  </aside>
</template>
