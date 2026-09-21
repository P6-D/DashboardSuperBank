<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Motion } from 'motion-v'
import { z } from 'zod'

import Button from '@/components/ui/Button.vue'
import MfaChallenge from './MfaChallenge.vue'
import { useAuthStore } from '@/stores/auth.store'
import { ApiClientError } from '@/types/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const email = ref('admin@securebank.testbed')
const password = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<{ email?: string; password?: string }>({})

const showMfa = computed(() => auth.mfaRequired)

async function onSubmit() {
  formError.value = null
  fieldErrors.value = {}

  const parsed = loginSchema.safeParse({ email: email.value, password: password.value })
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      fieldErrors.value[issue.path[0] as 'email' | 'password'] = issue.message
    }
    return
  }

  submitting.value = true
  try {
    const result = await auth.login(parsed.data.email, parsed.data.password)
    if (!result.mfaRequired) {
      redirectAfterLogin()
    }
  } catch (err) {
    formError.value = err instanceof ApiClientError ? err.message : 'Unable to sign in. Please try again.'
  } finally {
    submitting.value = false
  }
}

function redirectAfterLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  router.push(redirect)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[var(--color-surface-0)] px-4">
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.3 }"
      class="w-full max-w-sm"
    >
      <div class="mb-8 text-center">
        <p class="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">SecureBank</p>
        <p class="text-sm text-[var(--color-text-muted)]">Backoffice Console</p>
      </div>

      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6">
        <MfaChallenge v-if="showMfa" @verified="redirectAfterLogin" />

        <form v-else class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
              >Email</label
            >
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-[var(--color-danger)]">
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
              >Password</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-[var(--color-danger)]">
              {{ fieldErrors.password }}
            </p>
          </div>

          <p
            v-if="formError"
            class="rounded-md bg-[var(--color-danger-bg)] px-3 py-2 text-xs text-[var(--color-danger)]"
          >
            {{ formError }}
          </p>

          <Button type="submit" variant="primary" class="w-full" :loading="submitting">Sign in</Button>
        </form>
      </div>

      <p class="mt-6 text-center text-xs text-[var(--color-text-muted)]">
        Backoffice access requires an ADMIN account. This console is a testbed operational tool, not
        production banking software.
      </p>
    </Motion>
  </div>
</template>
