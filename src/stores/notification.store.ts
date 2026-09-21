import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  timeoutMs?: number
}

/** FRD §12.1 notification.store: toast/alert queue for the app shell. */
export const useNotificationStore = defineStore('notification', () => {
  const toasts = ref<Toast[]>([])
  const unreadAlertCount = ref(0)

  const hasToasts = computed(() => toasts.value.length > 0)

  function push(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, timeoutMs: 5000, ...toast })
    if (toast.timeoutMs !== 0) {
      setTimeout(() => dismiss(id), toast.timeoutMs ?? 5000)
    }
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(title: string, description?: string) {
    return push({ variant: 'success', title, description })
  }
  function error(title: string, description?: string) {
    return push({ variant: 'danger', title, description, timeoutMs: 8000 })
  }
  function warning(title: string, description?: string) {
    return push({ variant: 'warning', title, description })
  }
  function info(title: string, description?: string) {
    return push({ variant: 'info', title, description })
  }

  return { toasts, hasToasts, unreadAlertCount, push, dismiss, success, error, warning, info }
})
