<template>
  <div class="entries-view">
    <div class="page-header">
      <div class="header-content">
        <h1>All Entries</h1>
        <BaseButton @click="$router.push('/new-entry')"> ✏️ New Entry </BaseButton>
      </div>

      <div class="header-stats">
        <span>{{ filteredCount }} {{ filteredCount === 1 ? 'entry' : 'entries' }}</span>
        <span v-if="activeFilters.length > 0"> ({{ totalEntries }} total) </span>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="activeFilters.length > 0" class="active-filters">
      <div class="filter-label">Active filters:</div>
      <div class="filter-tags">
        <span v-for="filter in activeFilters" :key="filter.key" class="filter-tag">
          {{ filter.label }}
          <button class="filter-remove" @click="removeFilter(filter.key)">×</button>
        </span>
        <BaseButton variant="outline" size="small" @click="clearAllFilters"> Clear All </BaseButton>
      </div>
    </div>

    <!-- Main Content -->
    <div class="entries-content">
      <!-- Sidebar Filters -->
      <div class="sidebar">
        <BaseCard title="Filters" variant="outlined" class="filters-card">
          <!-- Search -->
          <div class="filter-section">
            <label class="filter-label">Search</label>
            <BaseInput v-model="searchTerm" placeholder="Search entries..." icon="🔍" />
          </div>

          <!-- Category Filter -->
          <div class="filter-section">
            <label class="filter-label">Category</label>
            <div class="filter-options">
              <label class="filter-option">
                <input type="radio" :value="''" v-model="selectedCategory" name="category" />
                All Categories
              </label>
              <label v-for="category in availableCategories" :key="category" class="filter-option">
                <input type="radio" :value="category" v-model="selectedCategory" name="category" />
                {{ category }} ({{ getCategoryCount(category) }})
              </label>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="filter-section">
            <label class="filter-label">Date Range</label>
            <div class="date-range-inputs">
              <BaseDatePicker v-model="dateFrom" placeholder="From date" />
              <BaseDatePicker v-model="dateTo" placeholder="To date" />
            </div>
          </div>

          <!-- Tag Filter -->
          <div v-if="availableTags.length > 0" class="filter-section">
            <label class="filter-label">Tags</label>
            <div class="tag-filter-options">
              <label v-for="tag in availableTags" :key="tag" class="tag-option">
                <input type="checkbox" :value="tag" v-model="selectedTags" />
                #{{ tag }}
              </label>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Entries List -->
      <div class="main-content">
        <LogEntryList
          :entries="filteredEntries"
          :loading="loading"
          :show-filters="false"
          :empty-message="emptyMessage"
          @edit="editEntry"
          @delete="deleteEntry"
          @create="$router.push('/new-entry')"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Delete Entry" @close="showDeleteModal = false">
      <div class="delete-modal-content">
        <div class="warning-icon">⚠️</div>
        <h3>Are you sure you want to delete this entry?</h3>
        <p v-if="entryToDelete">
          <strong>"{{ entryToDelete.title }}"</strong>
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import LogEntryList from '@/components/logbook/LogEntryList.vue'

const router = useRouter()
const route = useRoute()
const logbookStore = useLogbookStore()

// Filter state
const searchTerm = ref('')
const selectedCategory = ref('')
const dateFrom = ref(null)
const dateTo = ref(null)
const selectedTags = ref([])

// Modal state
const showDeleteModal = ref(false)
const entryToDelete = ref(null)
const deleting = ref(false)

// Computed properties
const loading = computed(() => logbookStore.loading)
const allEntries = computed(() => logbookStore.sortedEntries)
const availableCategories = computed(() => logbookStore.categories)
const availableTags = computed(() => logbookStore.allTags)

const filteredEntries = computed(() => {
  let filtered = [...allEntries.value]

  // Apply search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (entry) =>
        entry.title?.toLowerCase().includes(term) ||
        entry.description?.toLowerCase().includes(term) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
        entry.location?.toLowerCase().includes(term),
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((entry) => entry.category === selectedCategory.value)
  }

  // Apply date range filter
  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value)
    fromDate.setHours(0, 0, 0, 0)
    filtered = filtered.filter((entry) => new Date(entry.date) >= fromDate)
  }

  if (dateTo.value) {
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter((entry) => new Date(entry.date) <= toDate)
  }

  // Apply tag filter
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(
      (entry) => entry.tags && selectedTags.value.some((tag) => entry.tags.includes(tag)),
    )
  }

  return filtered
})

const totalEntries = computed(() => allEntries.value.length)
const filteredCount = computed(() => filteredEntries.value.length)

const activeFilters = computed(() => {
  const filters = []

  if (searchTerm.value) {
    filters.push({
      key: 'search',
      label: `Search: "${searchTerm.value}"`,
    })
  }

  if (selectedCategory.value) {
    filters.push({
      key: 'category',
      label: `Category: ${selectedCategory.value}`,
    })
  }

  if (dateFrom.value) {
    filters.push({
      key: 'dateFrom',
      label: `From: ${new Date(dateFrom.value).toLocaleDateString()}`,
    })
  }

  if (dateTo.value) {
    filters.push({
      key: 'dateTo',
      label: `To: ${new Date(dateTo.value).toLocaleDateString()}`,
    })
  }

  if (selectedTags.value.length > 0) {
    filters.push({
      key: 'tags',
      label: `Tags: ${selectedTags.value.map((tag) => '#' + tag).join(', ')}`,
    })
  }

  return filters
})

const emptyMessage = computed(() => {
  if (activeFilters.value.length > 0) {
    return 'No entries match your current filters. Try adjusting your search criteria.'
  }
  return 'Start documenting your journey by creating your first log entry.'
})

// Methods
const getCategoryCount = (category) => {
  return allEntries.value.filter((entry) => entry.category === category).length
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      searchTerm.value = ''
      break
    case 'category':
      selectedCategory.value = ''
      break
    case 'dateFrom':
      dateFrom.value = null
      break
    case 'dateTo':
      dateTo.value = null
      break
    case 'tags':
      selectedTags.value = []
      break
  }
}

const clearAllFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = ''
  dateFrom.value = null
  dateTo.value = null
  selectedTags.value = []
}

const editEntry = (entry) => {
  logbookStore.setSelectedEntry(entry)
  router.push(`/entry/${entry.id}/edit`)
}

const deleteEntry = (entry) => {
  entryToDelete.value = entry
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!entryToDelete.value) return

  deleting.value = true
  try {
    await logbookStore.deleteEntry(entryToDelete.value.id)
    showDeleteModal.value = false
    entryToDelete.value = null
  } catch (error) {
    console.error('Failed to delete entry:', error)
    // Could show an error message here
  } finally {
    deleting.value = false
  }
}

// Initialize from URL parameters
const initializeFromQuery = () => {
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  if (route.query.search) {
    searchTerm.value = route.query.search
  }
  if (route.query.tag) {
    selectedTags.value = Array.isArray(route.query.tag) ? route.query.tag : [route.query.tag]
  }
}

// Update URL when filters change
const updateQueryParams = () => {
  const query = {}

  if (selectedCategory.value) {
    query.category = selectedCategory.value
  }
  if (searchTerm.value) {
    query.search = searchTerm.value
  }
  if (selectedTags.value.length > 0) {
    query.tag = selectedTags.value
  }

  // Only update if query has changed
  const currentQuery = JSON.stringify(route.query)
  const newQuery = JSON.stringify(query)

  if (currentQuery !== newQuery) {
    router.replace({ query })
  }
}

// Watch for filter changes to update URL
watch([selectedCategory, searchTerm, selectedTags], updateQueryParams)

onMounted(() => {
  logbookStore.initializeStore()
  initializeFromQuery()
})
</script>

<style scoped>
.entries-view {
  width: 100%;
  margin: 0;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-content h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
}

.header-stats {
  color: #6b7280;
  font-size: 14px;
}

.active-filters {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tag {
  background-color: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.filter-remove:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.entries-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
}

.sidebar {
  height: fit-content;
  position: sticky;
  top: 24px;
}

.filters-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-section .filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
}

.filter-option input[type='radio'] {
  margin: 0;
}

.date-range-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-filter-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
}

.tag-option input[type='checkbox'] {
  margin: 0;
}

.main-content {
  min-width: 0; /* Prevents flex item from overflowing */
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

@media (max-width: 1024px) {
  .entries-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .entries-view {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .active-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tags {
    justify-content: flex-start;
  }
}
</style>
