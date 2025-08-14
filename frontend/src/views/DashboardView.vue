<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>DOST Client Management Dashboard</h1>
      <BaseButton @click="$router.push('/new-entry')" class="new-client-btn">
        <i class="btn-icon">📝</i> New Client
      </BaseButton>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <BaseCard variant="elevated" class="stat-card stat-primary">
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalClients }}</div>
          <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat-icon">👥</div>
      </BaseCard>

      <BaseCard variant="elevated" class="stat-card stat-success">
        <div class="stat-content">
          <div class="stat-number">{{ stats.activeClients }}</div>
          <div class="stat-label">Active Projects</div>
        </div>
        <div class="stat-icon">✅</div>
      </BaseCard>

      <BaseCard variant="elevated" class="stat-card stat-warning">
        <div class="stat-content">
          <div class="stat-number">{{ stats.highPriorityCount }}</div>
          <div class="stat-label">High Priority</div>
        </div>
        <div class="stat-icon">⚡</div>
      </BaseCard>

      <BaseCard variant="elevated" class="stat-card stat-info">
        <div class="stat-content">
          <div class="stat-number">{{ stats.thisMonthCount }}</div>
          <div class="stat-label">New This Month</div>
        </div>
        <div class="stat-icon">📊</div>
      </BaseCard>

      <BaseCard variant="elevated" class="stat-card stat-secondary">
        <div class="stat-content">
          <div class="stat-number">{{ stats.agenciesCount }}</div>
          <div class="stat-label">DOST Agencies</div>
        </div>
        <div class="stat-icon">🏛️</div>
      </BaseCard>

      <BaseCard variant="elevated" class="stat-card stat-accent">
        <div class="stat-content">
          <div class="stat-number">{{ stats.categoriesCount }}</div>
          <div class="stat-label">Service Types</div>
        </div>
        <div class="stat-icon">🔬</div>
      </BaseCard>
    </div>

    <!-- Quick Actions -->
    <BaseCard title="Quick Actions" variant="elevated" class="quick-actions">
      <div class="actions-grid">
        <div class="action-item" @click="$router.push('/new-entry')">
          <div class="action-icon">📝</div>
          <div class="action-text">
            <h3>Add New Client</h3>
            <p>Register a new client or project</p>
          </div>
        </div>

        <div class="action-item" @click="$router.push('/entries')">
          <div class="action-icon">👥</div>
          <div class="action-text">
            <h3>View All Clients</h3>
            <p>Browse complete client database</p>
          </div>
        </div>

        <div class="action-item" @click="showSearchModal = true">
          <div class="action-icon">🔍</div>
          <div class="action-text">
            <h3>Search Clients</h3>
            <p>Find specific clients or projects</p>
          </div>
        </div>

        <div class="action-item" @click="$router.push('/settings')">
          <div class="action-icon">⚙️</div>
          <div class="action-text">
            <h3>System Settings</h3>
            <p>Configure system preferences</p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Recent Clients -->
    <BaseCard title="Recent Client Activities" variant="elevated" class="recent-entries">
      <template #header>
        <div class="section-header">
          <h2>Recent Client Activities</h2>
          <BaseButton variant="outline" size="small" @click="$router.push('/entries')">
            View All Clients
          </BaseButton>
        </div>
      </template>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading client data...</p>
      </div>

      <div v-else-if="recentEntries.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No clients registered yet</h3>
        <p>Start managing your DOST clients by registering your first client!</p>
        <BaseButton @click="$router.push('/new-entry')"> Register First Client </BaseButton>
      </div>

      <div v-else class="entries-preview">
        <LogEntry
          v-for="entry in recentEntries"
          :key="entry.id"
          :entry="entry"
          :show-actions="false"
          @click="viewEntry(entry)"
        />
      </div>
    </BaseCard>

    <!-- Service Categories Overview -->
    <BaseCard title="Service Categories" variant="elevated" class="categories-overview">
      <div v-if="categories.length === 0" class="empty-categories">
        <p>No service categories yet. Register your first client to get started!</p>
      </div>

      <div v-else class="categories-grid">
        <div
          v-for="category in categories"
          :key="category"
          class="category-item"
          @click="viewCategoryEntries(category)"
        >
          <div class="category-name">{{ category }}</div>
          <div class="category-count">{{ getEntriesByCategory(category).length }} clients</div>
        </div>
      </div>
    </BaseCard>

    <!-- Search Modal -->
    <BaseModal v-model="showSearchModal" title="Search Clients" @close="showSearchModal = false">
      <div class="search-modal-content">
        <BaseInput
          v-model="searchTerm"
          placeholder="Search clients by company name, contact person, location, or technology tags..."
          icon="🔍"
          @input="performSearch"
        />

        <div v-if="searchResults.length > 0" class="search-results">
          <h3>Search Results ({{ searchResults.length }})</h3>
          <div class="search-results-list">
            <div
              v-for="entry in searchResults"
              :key="entry.id"
              class="search-result-item"
              @click="viewEntryFromSearch(entry)"
            >
              <h4>{{ entry.title }}</h4>
              <p>{{ entry.description.substring(0, 100) }}...</p>
              <div class="search-result-meta">
                <span>{{ formatDate(entry.date) }}</span>
                <span v-if="entry.category">{{ entry.category }}</span>
                <span v-if="entry.status" class="status-indicator">{{ entry.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="searchTerm && searchResults.length === 0" class="no-results">
          <p>No clients found matching "{{ searchTerm }}"</p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import LogEntry from '@/components/logbook/LogEntry.vue'

const router = useRouter()
const logbookStore = useLogbookStore()

// Modal state
const showSearchModal = ref(false)
const searchTerm = ref('')
const searchResults = ref([])

// Computed properties from store
const stats = computed(() => logbookStore.getStats)
const recentEntries = computed(() => logbookStore.recentEntries)
const categories = computed(() => logbookStore.categories)
const loading = computed(() => logbookStore.loading)

// Methods
const viewEntry = (entry) => {
  logbookStore.setSelectedEntry(entry)
  router.push(`/entry/${entry.id}`)
}

const viewCategoryEntries = (category) => {
  router.push(`/entries?category=${encodeURIComponent(category)}`)
}

const performSearch = () => {
  if (searchTerm.value.trim()) {
    searchResults.value = logbookStore.searchEntries(searchTerm.value)
  } else {
    searchResults.value = []
  }
}

const viewEntryFromSearch = (entry) => {
  showSearchModal.value = false
  searchTerm.value = ''
  searchResults.value = []
  viewEntry(entry)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getEntriesByCategory = (category) => {
  return logbookStore.getEntriesByCategory(category)
}

// Initialize store on mount
onMounted(() => {
  logbookStore.initializeStore()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  margin: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: calc(100vh - 140px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dashboard-header h1 {
  margin: 0;
  color: #1e3a8a;
  font-size: 28px;
  font-weight: 700;
}

.new-client-btn {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border: none;
  box-shadow: 0 4px 8px rgba(22, 163, 74, 0.3);
}

.new-client-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(22, 163, 74, 0.4);
}

.btn-icon {
  font-size: 16px;
  margin-right: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: none;
}

.stat-card {
  padding: 20px;
}

.stat-card .card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a8a;
  line-height: 1;
}

.stat-card.stat-primary .stat-number { color: #1e3a8a; }
.stat-card.stat-success .stat-number { color: #16a34a; }
.stat-card.stat-warning .stat-number { color: #d97706; }
.stat-card.stat-info .stat-number { color: #0891b2; }
.stat-card.stat-secondary .stat-number { color: #7c3aed; }
.stat-card.stat-accent .stat-number { color: #dc2626; }

.stat-card.stat-primary { border-left: 4px solid #1e3a8a; }
.stat-card.stat-success { border-left: 4px solid #16a34a; }
.stat-card.stat-warning { border-left: 4px solid #d97706; }
.stat-card.stat-info { border-left: 4px solid #0891b2; }
.stat-card.stat-secondary { border-left: 4px solid #7c3aed; }
.stat-card.stat-accent { border-left: 4px solid #dc2626; }

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.7;
}

.quick-actions .card-content {
  padding: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px;
  background-color: #e5e7eb;
}

.action-item {
  background-color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-item:hover {
  background-color: #f9fafb;
}

.action-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(30, 58, 138, 0.3);
}

.action-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.action-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
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

.entries-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entries-preview :deep(.log-entry) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.entries-preview :deep(.log-entry:hover) {
  transform: translateY(-2px);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.category-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.category-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.category-count {
  font-size: 14px;
  color: #6b7280;
}

.empty-categories {
  text-align: center;
  padding: 32px;
  color: #6b7280;
}

.search-modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 200px;
}

.search-results h3 {
  margin: 0 0 16px 0;
  color: #111827;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f3f4f6;
}

.search-result-item h4 {
  margin: 0 0 8px 0;
  color: #111827;
  font-size: 16px;
}

.search-result-item p {
  margin: 0 0 8px 0;
  color: #4b5563;
  font-size: 14px;
}

.search-result-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
  align-items: center;
  flex-wrap: wrap;
}

.status-indicator {
  background-color: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-results {
  text-align: center;
  padding: 32px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
    margin: 0;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
