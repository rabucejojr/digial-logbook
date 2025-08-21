<template>
  <div class="edit-entry-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading entry...</p>
    </div>

    <div v-else-if="!entry" class="error-state">
      <div class="error-icon">❌</div>
      <h2>Entry Not Found</h2>
      <p>The entry you're trying to edit doesn't exist or has been deleted.</p>
      <BaseButton @click="$router.push('/entries')"> Back to Entries </BaseButton>
    </div>

    <div v-else class="edit-content">
      <div class="page-header">
        <div class="header-content">
          <BaseButton variant="outline" size="small" @click="goBack"> ← Back </BaseButton>
          <!-- <h1>Edit Entry</h1> -->
        </div>
      </div>

      <BaseCard variant="elevated" class="form-container">
        <LogEntryForm
          :initial-data="entry"
          :loading="submitting"
          :available-categories="availableCategories"
          @submit="handleSubmit"
          @cancel="goBack"
        />
      </BaseCard>
    </div>

    <!-- Success Modal -->
    <BaseModal v-model="showSuccessModal" title="Entry Updated!" :show-close-button="false">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>Your entry has been updated successfully!</h3>
        <p>What would you like to do next?</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="continueEditing"> Continue Editing </BaseButton>
        <BaseButton @click="viewEntry"> View Entry </BaseButton>
        <BaseButton variant="secondary" @click="goToEntries"> Back to Entries </BaseButton>
      </template>
    </BaseModal>

    <!-- Error Modal -->
    <BaseModal v-model="showErrorModal" title="Error" @close="showErrorModal = false">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3>Failed to update entry</h3>
        <p>{{ errorMessage }}</p>
        <p>Please try again or contact support if the problem persists.</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showErrorModal = false"> Close </BaseButton>
        <BaseButton @click="retrySubmit"> Try Again </BaseButton>
      </template>
    </BaseModal>

    <!-- Unsaved Changes Modal -->
    <BaseModal v-model="showUnsavedModal" title="Unsaved Changes" :close-on-overlay-click="false">
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <h3>You have unsaved changes</h3>
        <p>Are you sure you want to leave? Your changes will be lost.</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="cancelNavigation">
          Stay and Continue Editing
        </BaseButton>
        <BaseButton variant="danger" @click="confirmNavigation"> Leave Without Saving </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import LogEntryForm from '@/components/logbook/LogEntryForm.vue'

const route = useRoute()
const router = useRouter()
const logbookStore = useLogbookStore()

// Component state
const loading = ref(true)
const submitting = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const showUnsavedModal = ref(false)
const errorMessage = ref('')
const lastSubmittedData = ref(null)
const updatedEntry = ref(null)
const hasUnsavedChanges = ref(false)
const pendingNavigation = ref(null)

// Computed properties
const entry = computed(() => {
  const entryId = route.params.id
  return logbookStore.getEntryById(entryId)
})

const availableCategories = computed(() => logbookStore.categories)

// Methods
const goBack = () => {
  if (hasUnsavedChanges.value) {
    pendingNavigation.value = () => router.back()
    showUnsavedModal.value = true
  } else {
    router.back()
  }
}

const goToEntries = () => {
  router.push('/entries')
}

const handleSubmit = async (entryData) => {
  submitting.value = true
  lastSubmittedData.value = entryData

  try {
    const updated = await logbookStore.updateEntry(entry.value.id, entryData)
    updatedEntry.value = updated
    hasUnsavedChanges.value = false
    showSuccessModal.value = true
  } catch (error) {
    errorMessage.value = error.message || 'An unexpected error occurred'
    showErrorModal.value = true
  } finally {
    submitting.value = false
  }
}

const retrySubmit = async () => {
  showErrorModal.value = false
  if (lastSubmittedData.value) {
    await handleSubmit(lastSubmittedData.value)
  }
}

const continueEditing = () => {
  showSuccessModal.value = false
  // Update the entry reference with the updated data
  if (updatedEntry.value) {
    logbookStore.setSelectedEntry(updatedEntry.value)
  }
}

const viewEntry = () => {
  if (updatedEntry.value) {
    showSuccessModal.value = false
    logbookStore.setSelectedEntry(updatedEntry.value)
    router.push(`/entry/${updatedEntry.value.id}`)
  }
}

const cancelNavigation = () => {
  showUnsavedModal.value = false
  pendingNavigation.value = null
}

const confirmNavigation = () => {
  showUnsavedModal.value = false
  hasUnsavedChanges.value = false

  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

// Navigation guard for unsaved changes
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    pendingNavigation.value = () => next()
    showUnsavedModal.value = true
    next(false)
  } else {
    next()
  }
})

// Browser beforeunload warning
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return event.returnValue
  }
}

// Form change detection (simplified - in real app would track actual form changes)
const simulateFormChange = () => {
  // This would be triggered by form input changes
  hasUnsavedChanges.value = true
}

onMounted(async () => {
  logbookStore.initializeStore()

  // Simulate loading delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  loading.value = false

  // Set selected entry in store
  if (entry.value) {
    logbookStore.setSelectedEntry(entry.value)
  }

  // Add beforeunload listener
  window.addEventListener('beforeunload', handleBeforeUnload)

  // Simulate form change after a delay (for demo purposes)
  setTimeout(() => {
    simulateFormChange()
  }, 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.edit-entry-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h2 {
  margin: 0 0 8px 0;
  color: #374151;
}

.error-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
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

.error-content .error-icon {
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

.warning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-content h3 {
  margin: 0 0 8px 0;
  color: #d97706;
  font-size: 20px;
}

.warning-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

@media (max-width: 768px) {
  .edit-entry-view {
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
