import type { RouteRecordRaw } from 'vue-router'

/** FRD §24 Example Route Map, adapted to what the backend actually implements (see README notes per-route below). */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/LoginPage.vue'),
    meta: { public: true, layout: 'auth' },
  },
  {
    path: '/',
    component: () => import('@/layouts/BackofficeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/DashboardPage.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/features/users/UserListPage.vue'),
        meta: { title: 'Users' },
      },
      {
        path: 'users/:userId',
        name: 'user-detail',
        component: () => import('@/features/users/UserDetailPage.vue'),
        meta: { title: 'User Detail' },
        props: true,
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/features/accounts/AccountListPage.vue'),
        meta: { title: 'Accounts' },
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/features/transactions/TransactionListPage.vue'),
        meta: { title: 'Transactions' },
      },
      {
        path: 'fraud',
        name: 'fraud',
        component: () => import('@/features/fraud/FraudQueuePage.vue'),
        meta: { title: 'Fraud Cases' },
      },
      {
        path: 'security/events',
        name: 'security-events',
        component: () => import('@/features/security-events/SecurityEventsPage.vue'),
        meta: { title: 'Security Events' },
      },
      {
        path: 'security/modules',
        name: 'security-modules',
        component: () => import('@/features/security-modules/SecurityModulesPage.vue'),
        meta: { title: 'Security Modules' },
      },
      {
        path: 'security/simulations',
        name: 'security-simulations',
        component: () => import('@/features/simulations/AttackSimulationsPage.vue'),
        meta: { title: 'Attack Simulations' },
      },
      {
        path: 'security/scans',
        name: 'security-scans',
        component: () => import('@/features/scans/VulnerabilityScansPage.vue'),
        meta: { title: 'Vulnerability Scans' },
      },
      {
        path: 'audit',
        name: 'audit',
        component: () => import('@/features/audit/AuditLogPage.vue'),
        meta: { title: 'Audit Logs' },
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/features/sessions/SessionsPage.vue'),
        meta: { title: 'Devices & Sessions' },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/features/roles/RolesPage.vue'),
        meta: { title: 'Roles & Permissions' },
      },
      {
        path: 'system/health',
        name: 'system-health',
        component: () => import('@/features/system-health/SystemHealthPage.vue'),
        meta: { title: 'System Health' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/features/misc/NotFoundPage.vue'),
    meta: { public: true },
  },
]
