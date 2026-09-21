import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'
import { authGuard } from '@/app/guards/auth.guard'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(authGuard)

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'Backoffice'
  document.title = `${title} · SecureBank Backoffice`
})
