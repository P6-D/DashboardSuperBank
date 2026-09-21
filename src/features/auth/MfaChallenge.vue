<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth.store'
import { ApiClientError } from '@/types/api'

const emit = defineEmits<{ verified: [] }>()

const auth = useAuthStore()
const code = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  error.value = null
  if (!/^\d{6}$/.test(code.value)) {
    error.value = 'Enter the 6-digit code from your authenticator app'
    return
  }
  submitting.value = true
  try {
    await auth.verifyMfa(code.value)
    emit('verified')
  } catch (err) {
    error.value = err instanceof ApiClientError ? err.message : 'Verification failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <p class="text-sm font-medium text-[var(--color-text-primary)]">Two-factor verification</p>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        Enter the 6-digit code from your authenticator app to continue.
      </p>
    </div>

    <div>
      <input
        v-model="code"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        placeholder="000000"
        class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-center font-mono text-lg tracking-[0.5em] text-[var(--color-text-primary)]"
      />
      <p v-if="error" class="mt-2 text-xs text-[var(--color-danger)]">{{ error }}</p>
    </div>

    <Button type="submit" variant="primary" class="w-full" :loading="submitting">Verify</Button>
  </form>
</template>
