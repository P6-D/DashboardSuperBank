import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type SecureBankEnvironment = 'DEV' | 'STAGING' | 'RED_TEAM' | 'BLUE_TEAM'

/**
 * FRD §12.1 environment.store + §20.2/§20.3: environment banner and
 * simulation-availability gating. The current single-node testbed backend
 * has no environment endpoint, so this is sourced from a build-time env var
 * (VITE_SECUREBANK_ENV) with a safe default — simulations remain visually
 * gated here, but the backend is the authoritative enforcement point
 * (FRD §20.3: "frontend may hide unavailable controls, backend enforcement
 * is mandatory" — this backend does not yet enforce environment restriction
 * on /security/simulate, which is a tracked gap, not something this UI can
 * fix on its own).
 */
export const useEnvironmentStore = defineStore('environment', () => {
  const current = ref<SecureBankEnvironment>(
    (import.meta.env.VITE_SECUREBANK_ENV as SecureBankEnvironment | undefined) ?? 'DEV',
  )

  const isProductionLike = computed(() => false) // FRD §20.1: production is explicitly out of scope
  const simulationsAvailable = computed(() =>
    (['DEV', 'STAGING', 'RED_TEAM'] as SecureBankEnvironment[]).includes(current.value),
  )

  const badgeColor = computed(() => {
    switch (current.value) {
      case 'RED_TEAM':
        return 'danger'
      case 'BLUE_TEAM':
        return 'info'
      case 'STAGING':
        return 'warning'
      default:
        return 'neutral'
    }
  })

  return { current, isProductionLike, simulationsAvailable, badgeColor }
})
