<template>
  <div class="log-entry-list">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading entries...</p>
    </div>

    <div v-else-if="filteredEntries.length === 0" class="empty-state">
      <div class="empty-icon">📔</div>
      <h3>No entries found</h3>
      <p>{{ emptyMessage }}</p>
      <BaseButton @click="$emit('create')"> Create your first entry </BaseButton>
    </div>

    <div v-else class="entries-container">
      <div v-if="showFilters" class="filters">
        <BaseInput
          v-model="searchTerm"
          placeholder="Search entries..."
          icon="🔍"
          class="search-input"
        />

        <select v-model="selectedCategory" class="category-filter">
          <option value="">All Categories</option>
          <option v-for="category in availableCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select v-model="sortBy" class="sort-filter">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
        </select>
      </div>

      <div class="entries">
        <LogEntry
          v-for="entry in paginatedEntries"
          :key="entry.id"
          :entry="entry"
          :show-actions="showActions"
          :show-details="showDetails"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <div v-if="showPagination && totalPages > 1" class="pagination">
        <BaseButton variant="outline" :disabled="currentPage === 1" @click="currentPage--">
          Previous
        </BaseButton>

        <span class="pagination-info"> Page {{ currentPage }} of {{ totalPages }} </span>

        <BaseButton variant="outline" :disabled="currentPage === totalPages" @click="currentPage++">
          Next
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import LogEntry from './LogEntry.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
  showFilters: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  emptyMessage: {
    type: String,
    default: 'Start documenting your journey by creating your first log entry.',
  },
})

defineEmits(['edit', 'delete', 'create'])

// Filter and search state
const searchTerm = ref('')
const selectedCategory = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)

// Available categories for filter
const availableCategories = computed(() => {
  const categories = new Set()
  props.entries.forEach((entry) => {
    if (entry.category) {
      categories.add(entry.category)
    }
  })
  return Array.from(categories).sort()
})

// Filtered and sorted entries
const filteredEntries = computed(() => {
  let filtered = [...props.entries]

  // Apply search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (entry) =>
        entry.title?.toLowerCase().includes(term) ||
        entry.description?.toLowerCase().includes(term) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(term)),
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((entry) => entry.category === selectedCategory.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '')
      default:
        return 0
    }
  })

  return filtered
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredEntries.value.length / props.itemsPerPage)
})

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredEntries.value.slice(start, end)
})

// Reset pagination when filters change
watch([searchTerm, selectedCategory, sortBy], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.log-entry-list {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6b7280;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
  max-width: 400px;
}

.entries-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.category-filter,
.sort-filter {
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.category-filter:focus,
.sort-filter:focus {
  outline: none;
  border-color: #3b82f6;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}
</style>
