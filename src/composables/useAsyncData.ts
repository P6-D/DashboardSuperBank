import { type Ref, ref, shallowRef, watch } from 'vue'

import { ApiClientError } from '@/types/api'

export interface AsyncDataOptions {
  /** Re-run automatically whenever these refs change (debounced). */
  watch?: Ref<unknown>[]
  debounceMs?: number
  immediate?: boolean
}

/**
 * FRD §12.2: "Remote data should use query composables ... Pinia should
 * contain shared application state rather than every API response." This is
 * the shared server-state composable used by all list/detail pages instead
 * of stashing API responses in Pinia stores.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, options: AsyncDataOptions = {}) {
  const data = shallowRef<T | null>(null)
  const loading = ref(options.immediate !== false)
  const error = ref<string | null>(null)
  const requestId = ref<string | undefined>(undefined)

  let generation = 0

  async function execute() {
    const thisGeneration = ++generation
    loading.value = true
    error.value = null
    try {
      const result = await fetcher()
      if (thisGeneration === generation) {
        data.value = result
      }
    } catch (err) {
      if (thisGeneration !== generation) return
      if (err instanceof ApiClientError) {
        error.value = err.message
        requestId.value = err.requestId
      } else {
        error.value = err instanceof Error ? err.message : 'Unexpected error'
      }
    } finally {
      if (thisGeneration === generation) {
        loading.value = false
      }
    }
  }

  if (options.watch?.length) {
    let timer: ReturnType<typeof setTimeout> | undefined
    watch(
      options.watch,
      () => {
        clearTimeout(timer)
        timer = setTimeout(execute, options.debounceMs ?? 300)
      },
      { deep: true },
    )
  }

  if (options.immediate !== false) {
    execute()
  }

  return { data, loading, error, requestId, refresh: execute }
}
