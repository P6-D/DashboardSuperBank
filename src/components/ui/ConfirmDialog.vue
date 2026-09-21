<script setup lang="ts">
import { ref, watch } from 'vue'

import Button from './Button.vue'
import Modal from './Modal.vue'

/**
 * FRD §6.2 destructive-action pattern: permission is checked by the caller,
 * this dialog enforces confirmation + optional reason capture + shows what
 * will happen, before firing a single confirm event.
 */
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    variant?: 'danger' | 'primary'
    requireReason?: boolean
    loading?: boolean
  }>(),
  { confirmLabel: 'Confirm', variant: 'danger', requireReason: false, loading: false },
)

const emit = defineEmits<{ close: []; confirm: [reason: string | undefined] }>()

const reason = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) reason.value = ''
  },
)

function onConfirm() {
  if (props.requireReason && !reason.value.trim()) return
  emit('confirm', props.requireReason ? reason.value.trim() : undefined)
}
</script>

<template>
  <Modal :open="open" :title="title" @close="emit('close')">
    <p class="text-sm text-[var(--color-text-secondary)]">{{ description }}</p>

    <div v-if="requireReason" class="mt-4">
      <label class="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]" for="confirm-reason">
        Reason (required, recorded in audit log)
      </label>
      <textarea
        id="confirm-reason"
        v-model="reason"
        rows="3"
        class="focus-ring w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        placeholder="Explain why this action is being taken…"
      />
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <Button variant="ghost" @click="emit('close')">Cancel</Button>
      <Button
        :variant="variant"
        :loading="loading"
        :disabled="requireReason && !reason.trim()"
        @click="onConfirm"
      >
        {{ confirmLabel }}
      </Button>
    </div>
  </Modal>
</template>
