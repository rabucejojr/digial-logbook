<template>
  <div class="new-entry-view">
    <div class="page-header">
      <div class="header-content">
        <BaseButton variant="outline" size="small" @click="goBack"> ← Back </BaseButton>
        <h1>Create New Entry</h1>
      </div>
    </div>

    <BaseCard variant="elevated" class="form-container">
      <LogEntryForm
        :loading="loading"
        :available-categories="availableCategories"
        @submit="handleSubmit"
        @cancel="goBack"
      />
    </BaseCard>

    <!-- Success Modal -->
    <BaseModal v-model="showSuccessModal" title="Entry Created!" :show-close-button="false">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>Your entry has been created successfully!</h3>
        <p>What would you like to do next?</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="createAnother"> Create Another </BaseButton>
        <BaseButton @click="viewEntry"> View Entry </BaseButton>
        <BaseButton variant="secondary" @click="goToDashboard"> Go to Dashboard </BaseButton>
      </template>
    </BaseModal>

    <!-- Error Modal -->
    <BaseModal v-model="showErrorModal" title="Error" @close="showErrorModal = false">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3>Failed to create entry</h3>
        <p>{{ errorMessage }}</p>
        <p>Please try again or contact support if the problem persists.</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showErrorModal = false"> Close </BaseButton>
        <BaseButton @click="retrySubmit"> Try Again </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import LogEntryForm from '@/components/logbook/LogEntryForm.vue'

const router = useRouter()
const logbookStore = useLogbookStore()

// Component state
const loading = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')
const lastSubmittedData = ref(null)
const createdEntry = ref(null)

// Computed properties
const availableCategories = computed(() => logbookStore.categories)

// Methods
const goBack = () => {
  router.back()
}

const goToDashboard = () => {
  router.push('/')
}

const handleSubmit = async (entryData) => {
  loading.value = true
  lastSubmittedData.value = entryData

  try {
    const newEntry = await logbookStore.createEntry(entryData)
    createdEntry.value = newEntry
    showSuccessModal.value = true
  } catch (error) {
    errorMessage.value = error.message || 'An unexpected error occurred'
    showErrorModal.value = true
  } finally {
    loading.value = false
  }
}

const retrySubmit = async () => {
  showErrorModal.value = false
  if (lastSubmittedData.value) {
    await handleSubmit(lastSubmittedData.value)
  }
}

const createAnother = () => {
  showSuccessModal.value = false
  createdEntry.value = null
  lastSubmittedData.value = null
  // The form will reset automatically since we're not passing initial data
}

const viewEntry = () => {
  if (createdEntry.value) {
    showSuccessModal.value = false
    logbookStore.setSelectedEntry(createdEntry.value)
    router.push(`/entry/${createdEntry.value.id}`)
  }
}

// Handle navigation warnings for unsaved changes
const handleBeforeUnload = (event) => {
  // Only show warning if form has been modified
  // This would need to be implemented based on form state
  // For now, we'll skip this feature
}

onMounted(() => {
  // Initialize store to ensure categories are available
  logbookStore.initializeStore()

  // Clear any previous errors
  logbookStore.clearError()

  // Add beforeunload listener for unsaved changes warning
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Cleanup
const cleanup = () => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
}

// Component cleanup
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.new-entry-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
}

.form-container {
  padding: 32px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-content h3 {
  margin: 0 0 8px 0;
  color: #059669;
  font-size: 20px;
}

.success-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-content h3 {
  margin: 0 0 8px 0;
  color: #dc2626;
  font-size: 20px;
}

.error-content p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 16px;
}

@media (max-width: 768px) {
  .new-entry-view {
    padding: 16px;
  }

  .form-container {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-content h1 {
    font-size: 24px;
  }
}
</style>
