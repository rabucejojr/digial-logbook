<template>
  <div class="entry-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading entry...</p>
    </div>

    <div v-else-if="!entry" class="error-state">
      <div class="error-icon">❌</div>
      <h2>Entry Not Found</h2>
      <p>The entry you're looking for doesn't exist or has been deleted.</p>
      <BaseButton @click="$router.push('/entries')"> Back to Entries </BaseButton>
    </div>

    <div v-else class="entry-content">
      <!-- Navigation -->
      <div class="page-header">
        <div class="nav-actions">
          <BaseButton variant="outline" size="small" @click="goBack"> ← Back </BaseButton>

          <div class="entry-actions">
            <BaseButton variant="outline" size="small" @click="editEntry"> ✏️ Edit </BaseButton>
            <BaseButton variant="danger" size="small" @click="showDeleteModal = true">
              🗑️ Delete
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Entry Display -->
      <BaseCard variant="elevated" class="entry-card">
        <!-- Entry Header -->
        <template #header>
          <div class="entry-header">
            <div class="entry-title-section">
              <h1 class="entry-title">{{ entry.title }}</h1>
              <div class="entry-meta">
                <span class="entry-date">{{ formattedDate }}</span>
                <span v-if="entry.category" class="entry-category">
                  <span class="category-badge">{{ entry.category }}</span>
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Entry Body -->
        <div class="entry-body">
          <!-- Main Content -->
          <div class="entry-description">
            <p>{{ entry.description }}</p>
          </div>

          <!-- Additional Information -->
          <div v-if="hasAdditionalInfo" class="entry-details">
            <div v-if="entry.location" class="detail-item">
              <div class="detail-icon">📍</div>
              <div class="detail-content">
                <div class="detail-label">Location</div>
                <div class="detail-value">{{ entry.location }}</div>
              </div>
            </div>

            <div v-if="entry.weather" class="detail-item">
              <div class="detail-icon">🌤️</div>
              <div class="detail-content">
                <div class="detail-label">Weather</div>
                <div class="detail-value">{{ entry.weather }}</div>
              </div>
            </div>

            <div v-if="entry.tags && entry.tags.length" class="detail-item">
              <div class="detail-icon">🏷️</div>
              <div class="detail-content">
                <div class="detail-label">Tags</div>
                <div class="tags-display">
                  <span v-for="tag in entry.tags" :key="tag" class="tag" @click="searchByTag(tag)">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Entry Footer -->
        <template #footer>
          <div class="entry-footer">
            <div class="timestamp-info">
              <small class="created-info"> Created: {{ formattedCreatedDate }} </small>
              <small
                v-if="entry.updatedAt && entry.updatedAt !== entry.createdAt"
                class="updated-info"
              >
                Last updated: {{ formattedUpdatedDate }}
              </small>
            </div>

            <div class="footer-actions">
              <BaseButton variant="outline" size="small" @click="shareEntry"> 📤 Share </BaseButton>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Related Entries -->
      <div v-if="relatedEntries.length > 0" class="related-entries">
        <BaseCard title="Related Entries" variant="elevated">
          <div class="related-entries-list">
            <div
              v-for="relatedEntry in relatedEntries"
              :key="relatedEntry.id"
              class="related-entry-item"
              @click="viewRelatedEntry(relatedEntry)"
            >
              <h4>{{ relatedEntry.title }}</h4>
              <p>{{ relatedEntry.description.substring(0, 100) }}...</p>
              <div class="related-entry-meta">
                <span>{{ formatDate(relatedEntry.date) }}</span>
                <span v-if="relatedEntry.category">{{ relatedEntry.category }}</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete Entry" @close="showDeleteModal = false">
      <div class="delete-modal-content">
        <div class="warning-icon">⚠️</div>
        <h3>Are you sure you want to delete this entry?</h3>
        <p>
          <strong>"{{ entry?.title }}"</strong>
        </p>
        <p>This action cannot be undone.</p>
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="showDeleteModal = false"> Cancel </BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="confirmDelete">
          Delete Entry
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Share Modal -->
    <BaseModal v-model="showShareModal" title="Share Entry" @close="showShareModal = false">
      <div class="share-modal-content">
        <div class="share-icon">📤</div>
        <h3>Share This Entry</h3>
        <p>Copy the link below to share this entry:</p>

        <div class="share-link-container">
          <input ref="shareLinkInput" :value="shareLink" readonly class="share-link-input" />
          <BaseButton variant="outline" size="small" @click="copyShareLink">
            {{ linkCopied ? 'Copied!' : 'Copy' }}
          </BaseButton>
        </div>
      </div>

      <template #footer>
        <BaseButton @click="showShareModal = false"> Close </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const logbookStore = useLogbookStore()

// Component state
const loading = ref(true)
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const deleting = ref(false)
const linkCopied = ref(false)
const shareLinkInput = ref(null)

// Computed properties
const entry = computed(() => {
  const entryId = route.params.id
  return logbookStore.getEntryById(entryId)
})

const hasAdditionalInfo = computed(() => {
  return (
    entry.value &&
    (entry.value.location ||
      entry.value.weather ||
      (entry.value.tags && entry.value.tags.length > 0))
  )
})

const formattedDate = computed(() => {
  if (!entry.value?.date) return ''
  const date = new Date(entry.value.date)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedCreatedDate = computed(() => {
  if (!entry.value?.createdAt) return ''
  return new Date(entry.value.createdAt).toLocaleString()
})

const formattedUpdatedDate = computed(() => {
  if (!entry.value?.updatedAt) return ''
  return new Date(entry.value.updatedAt).toLocaleString()
})

const shareLink = computed(() => {
  return window.location.href
})

const relatedEntries = computed(() => {
  if (!entry.value) return []

  const currentEntry = entry.value
  const allEntries = logbookStore.sortedEntries

  // Find entries with same category or tags
  const related = allEntries
    .filter((e) => e.id !== currentEntry.id)
    .filter((e) => {
      // Same category
      if (e.category && currentEntry.category && e.category === currentEntry.category) {
        return true
      }

      // Shared tags
      if (e.tags && currentEntry.tags) {
        return e.tags.some((tag) => currentEntry.tags.includes(tag))
      }

      return false
    })
    .slice(0, 3) // Limit to 3 related entries

  return related
})

// Methods
const goBack = () => {
  router.back()
}

const editEntry = () => {
  router.push(`/entry/${entry.value.id}/edit`)
}

const confirmDelete = async () => {
  if (!entry.value) return

  deleting.value = true
  try {
    await logbookStore.deleteEntry(entry.value.id)
    showDeleteModal.value = false
    router.push('/entries')
  } catch (error) {
    console.error('Failed to delete entry:', error)
    // Could show an error message here
  } finally {
    deleting.value = false
  }
}

const shareEntry = () => {
  showShareModal.value = true
  linkCopied.value = false
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    // Fallback for older browsers
    if (shareLinkInput.value) {
      shareLinkInput.value.select()
      document.execCommand('copy')
      linkCopied.value = true
      setTimeout(() => {
        linkCopied.value = false
      }, 2000)
    }
  }
}

const searchByTag = (tag) => {
  router.push(`/entries?tag=${encodeURIComponent(tag)}`)
}

const viewRelatedEntry = (relatedEntry) => {
  router.push(`/entry/${relatedEntry.id}`)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Initialize
onMounted(async () => {
  logbookStore.initializeStore()

  // Simulate loading delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  loading.value = false

  // Set selected entry in store
  if (entry.value) {
    logbookStore.setSelectedEntry(entry.value)
  }
})
</script>

<style scoped>
.entry-detail-view {
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

.nav-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-actions {
  display: flex;
  gap: 8px;
}

.entry-card {
  margin-bottom: 24px;
}

.entry-header {
  width: 100%;
}

.entry-title-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.entry-date {
  color: #6b7280;
  font-size: 16px;
}

.category-badge {
  background-color: #3b82f6;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.entry-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.entry-description {
  font-size: 16px;
  line-height: 1.7;
  color: #374151;
}

.entry-description p {
  margin: 0;
  white-space: pre-wrap;
}

.entry-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  font-size: 20px;
  margin-top: 2px;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-value {
  color: #6b7280;
  font-size: 14px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background-color: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag:hover {
  background-color: #d1d5db;
}

.entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.timestamp-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.created-info,
.updated-info {
  color: #9ca3af;
  font-size: 12px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.related-entries-list {
  display: grid;
  gap: 16px;
}

.related-entry-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-entry-item:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.related-entry-item h4 {
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
}

.related-entry-item p {
  margin: 0 0 8px 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.related-entry-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.delete-modal-content {
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

.delete-modal-content h3 {
  margin: 0 0 8px 0;
  color: #dc2626;
  font-size: 20px;
}

.delete-modal-content p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 16px;
}

.share-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.share-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.share-modal-content h3 {
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 20px;
}

.share-modal-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 16px;
}

.share-link-container {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.share-link-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9fafb;
  color: #6b7280;
}

.share-link-input:focus {
  outline: none;
  border-color: #3b82f6;
}

@media (max-width: 768px) {
  .entry-detail-view {
    padding: 16px;
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .entry-actions {
    justify-content: center;
  }

  .entry-title {
    font-size: 24px;
  }

  .entry-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .entry-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .share-link-container {
    flex-direction: column;
  }
}
</style>
