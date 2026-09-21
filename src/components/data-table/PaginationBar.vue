<script setup lang="ts">
import { computed } from 'vue'

import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

const rangeStart = computed(() => (props.totalCount === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.totalCount))
</script>

<template>
  <div class="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
    <p class="text-xs text-[var(--color-text-secondary)]">
      Showing
      <span class="font-medium text-[var(--color-text-primary)]">{{ rangeStart }}–{{ rangeEnd }}</span> of
      <span class="font-medium text-[var(--color-text-primary)]">{{ totalCount }}</span>
    </p>
    <div class="flex items-center gap-2">
      <Button size="sm" variant="ghost" :disabled="page <= 1" @click="emit('update:page', page - 1)">
        Previous
      </Button>
      <span class="text-xs text-[var(--color-text-secondary)]"
        >Page {{ page }} of {{ Math.max(totalPages, 1) }}</span
      >
      <Button size="sm" variant="ghost" :disabled="page >= totalPages" @click="emit('update:page', page + 1)">
        Next
      </Button>
    </div>
  </div>
</template>
