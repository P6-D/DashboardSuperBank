<script setup lang="ts">
import UnavailableFeature from '@/components/ui/UnavailableFeature.vue'
</script>

<template>
  <UnavailableFeature
    title="Accounts module not available"
    reason="The backend does not expose an admin-wide accounts listing, balance view, or account-freeze endpoint. Account data exists only per-authenticated-user in the mobile app's own account context — there is no /admin/accounts API for the backoffice to call."
    required-endpoint="GET /admin/accounts, PATCH /admin/accounts/{id}/freeze (not implemented)"
  />
</template>
