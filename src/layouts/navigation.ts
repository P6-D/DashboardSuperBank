import type { Permission } from '@/stores/permission.store'

export interface NavItem {
  label: string
  routeName: string
  permission: Permission
  /** Marks FRD-specified nav items with no backing backend endpoint yet (see UnavailableFeature.vue). */
  unavailable?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** FRD §5.1 Primary Navigation, trimmed/annotated against actual backend capability. */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', routeName: 'dashboard', permission: 'dashboard.read' }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Users', routeName: 'users', permission: 'users.read' },
      { label: 'Accounts', routeName: 'accounts', permission: 'users.read', unavailable: true },
      { label: 'Transactions', routeName: 'transactions', permission: 'users.read', unavailable: true },
      { label: 'Fraud Cases', routeName: 'fraud', permission: 'fraud.read' },
      { label: 'Devices & Sessions', routeName: 'sessions', permission: 'sessions.read' },
    ],
  },
  {
    label: 'Security',
    items: [
      { label: 'Security Events', routeName: 'security-events', permission: 'security.events.read' },
      { label: 'Security Modules', routeName: 'security-modules', permission: 'security.modules.read' },
      {
        label: 'Attack Simulation',
        routeName: 'security-simulations',
        permission: 'security.simulation.execute',
      },
      { label: 'Vulnerability Scans', routeName: 'security-scans', permission: 'security.scan.execute' },
    ],
  },
  {
    label: 'Audit & Reports',
    items: [{ label: 'Audit Logs', routeName: 'audit', permission: 'audit.read' }],
  },
  {
    label: 'System',
    items: [
      { label: 'Service Health', routeName: 'system-health', permission: 'system.health.read' },
      { label: 'Roles & Permissions', routeName: 'roles', permission: 'users.read', unavailable: true },
    ],
  },
]
