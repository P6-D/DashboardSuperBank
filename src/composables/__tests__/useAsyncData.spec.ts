import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAsyncData } from '../useAsyncData'
import { ApiClientError } from '@/types/api'
import { ref } from 'vue'

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('initializes with loading true by default (immediate true)', () => {
    const { data, loading, error } = useAsyncData(async () => 'test')
    expect(data.value).toBeNull()
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('initializes with idle state if immediate is false', () => {
    const { data, loading, error } = useAsyncData(async () => 'test', { immediate: false })
    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('transitions to success', async () => {
    const fetcher = vi.fn().mockResolvedValue('success-data')
    const { data, loading, error, refresh } = useAsyncData(fetcher, { immediate: false })

    const promise = refresh()
    
    // Immediate synchronous check after starting
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()

    await promise

    // After resolution
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(data.value).toBe('success-data')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('handles ApiClientError correctly', async () => {
    const fetcher = vi.fn().mockRejectedValue(new ApiClientError('Network Error', 500, 'req-id'))
    const { data, loading, error, requestId, refresh } = useAsyncData(fetcher, { immediate: false })

    await refresh()

    expect(loading.value).toBe(false)
    expect(data.value).toBeNull()
    expect(error.value).toBe('Network Error')
    expect(requestId.value).toBe('req-id')
  })

  it('debounces watched dependencies', async () => {
    const fetcher = vi.fn().mockResolvedValue('success-data')
    const trigger = ref('A')
    useAsyncData(fetcher, { watch: [trigger], debounceMs: 100, immediate: false })

    // Change dependency a few times rapidly
    trigger.value = 'B'
    trigger.value = 'C'
    
    // Nothing fired yet
    expect(fetcher).not.toHaveBeenCalled()
    
    // Wait for debounce window to pass
    await vi.advanceTimersByTimeAsync(150)
    
    // Should have only triggered once
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('executes immediately upon initialization by default', async () => {
    const fetcher = vi.fn().mockResolvedValue('immediate-data')
    const { data, loading } = useAsyncData(fetcher)

    expect(loading.value).toBe(true)
    
    // Wait for the microtask queue to drain
    await vi.runAllTimersAsync()
    
    expect(data.value).toBe('immediate-data')
    expect(loading.value).toBe(false)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})