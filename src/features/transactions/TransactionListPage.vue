<script setup lang="ts">
import UnavailableFeature from '@/components/ui/UnavailableFeature.vue'
</script>

<template>
  <UnavailableFeature
    title="Transactions explorer not available"
    reason="The backend has no admin-wide transaction search/list endpoint and no transaction-reverse capability. Fraud cases reference a transactionId, but there is no way to look up or list the underlying transaction records from the backoffice API."
    required-endpoint="GET /admin/transactions, POST /admin/transactions/{id}/reverse (not implemented)"
  />
</template>
