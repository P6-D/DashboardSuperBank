<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UnavailableFeature from '@/components/ui/UnavailableFeature.vue'
</script>

<template>
  <div class="space-y-6">
    <UnavailableFeature
      title="Granular roles & permissions not available"
      reason="The backend's domain model (domain/entity/User.kt UserRole) defines exactly two roles — USER and ADMIN — with no roles table, permission grants, or role-management API. This backoffice therefore only distinguishes ADMIN vs non-admin; it cannot create custom roles or fine-grained permission sets."
      required-endpoint="GET/POST /admin/roles, /admin/permissions (not implemented)"
    />

    <Card>
      <h2 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Roles actually enforced by the backend
      </h2>
      <ul class="space-y-2 text-sm">
        <li class="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
          <span class="text-[var(--color-text-primary)]">ADMIN</span>
          <StatusBadge tone="info" label="Full backoffice access (hasRole checks)" />
        </li>
        <li class="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3">
          <span class="text-[var(--color-text-primary)]">USER</span>
          <StatusBadge tone="neutral" label="No backoffice access" />
        </li>
      </ul>
    </Card>
  </div>
</template>
