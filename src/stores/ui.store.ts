import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

/** FRD §12.1 ui.store + §6.6 reduced-motion support. */
export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(localStorage.getItem('securebank_bo_sidebar') === '1')
  const prefersReducedMotion = ref(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const commandPaletteOpen = ref(false)

  if (typeof window !== 'undefined') {
    window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => (prefersReducedMotion.value = e.matches))
  }

  watch(sidebarCollapsed, (v) => localStorage.setItem('securebank_bo_sidebar', v ? '1' : '0'))

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, prefersReducedMotion, commandPaletteOpen, toggleSidebar }
})
