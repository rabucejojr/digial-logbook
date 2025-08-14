<template>
  <div class="settings-view">
    <div class="page-header">
      <div class="header-content">
        <BaseButton variant="outline" size="small" @click="$router.back()"> ← Back </BaseButton>
        <h1>Settings</h1>
      </div>
    </div>

    <div class="settings-content">
      <!-- App Preferences -->
      <BaseCard title="App Preferences" variant="elevated" class="settings-section">
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Theme</h3>
              <p>Choose your preferred color theme</p>
            </div>
            <select v-model="settings.theme" class="setting-select" @change="saveSettings">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Default Category</h3>
              <p>Category to pre-select when creating new entries</p>
            </div>
            <select
              v-model="settings.defaultCategory"
              class="setting-select"
              @change="saveSettings"
            >
              <option value="">None</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Entries Per Page</h3>
              <p>Number of entries to show per page in lists</p>
            </div>
            <select v-model="settings.entriesPerPage" class="setting-select" @change="saveSettings">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Auto-save</h3>
              <p>Automatically save entries as you type</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.autoSave" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </BaseCard>

      <!-- Data Management -->
      <BaseCard title="Data Management" variant="elevated" class="settings-section">
        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Export Data</h3>
              <p>Download all your entries as JSON or CSV</p>
            </div>
            <div class="setting-actions">
              <BaseButton
                variant="outline"
                size="small"
                @click="exportData('json')"
                :loading="exporting.json"
              >
                Export JSON
              </BaseButton>
              <BaseButton
                variant="outline"
                size="small"
                @click="exportData('csv')"
                :loading="exporting.csv"
              >
                Export CSV
              </BaseButton>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h3>Import Data</h3>
              <p>Import entries from a JSON file</p>
            </div>
            <div class="setting-actions">
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                style="display: none"
                @change="handleFileImport"
              />
              <BaseButton
                variant="outline"
                size="small"
                @click="$refs.fileInput.click()"
                :loading="importing"
              >
                Choose File
              </BaseButton>
            </div>
          </div>

          <div class="setting-item danger-item">
            <div class="setting-info">
              <h3>Clear All Data</h3>
              <p>Permanently delete all entries and reset the app</p>
            </div>
            <BaseButton variant="danger" size="small" @click="showClearDataModal = true">
              Clear All Data
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Statistics -->
      <BaseCard title="Your Statistics" variant="elevated" class="settings-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalEntries }}</div>
            <div class="stat-label">Total Entries</div>
          </div>

          <div class="stat-item">
            <div class="stat-value">{{ stats.categoriesCount }}</div>
            <div class="stat-label">Categories</div>
          </div>

          <div class="stat-item">
            <div class="stat-value">{{ stats.tagsCount }}</div>
            <div class="stat-label">Unique Tags</div>
          </div>

          <div class="stat-item">
            <div class="stat-value">{{ stats.currentStreak }}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>
      </BaseCard>

      <!-- About -->
      <BaseCard title="About" variant="elevated" class="settings-section">
        <div class="about-content">
          <h3>Digital Logbook</h3>
          <p>Version 1.0.0</p>
          <p>
            A simple and beautiful way to keep track of your daily experiences, thoughts, and
            memories.
          </p>

          <div class="about-links">
            <a href="#" class="about-link">Privacy Policy</a>
            <a href="#" class="about-link">Terms of Service</a>
            <a href="#" class="about-link">Support</a>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Clear Data Confirmation Modal -->
    <BaseModal
      v-model="showClearDataModal"
      title="Clear All Data"
      @close="showClearDataModal = false"
    >
      <div class="danger-modal-content">
        <div class="danger-icon">⚠️</div>
        <h3>Are you absolutely sure?</h3>
        <p>
          This will permanently delete all your entries, categories, and settings. This action
          cannot be undone.
        </p>
        <p>Type <strong>"DELETE"</strong> to confirm:</p>
        <BaseInput
          v-model="confirmText"
          placeholder="Type DELETE to confirm"
          :error="confirmError"
        />
      </div>

      <template #footer>
        <BaseButton variant="outline" @click="cancelClearData"> Cancel </BaseButton>
        <BaseButton
          variant="danger"
          :disabled="confirmText !== 'DELETE'"
          :loading="clearing"
          @click="confirmClearData"
        >
          Clear All Data
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Success Modal -->
    <BaseModal v-model="showSuccessModal" title="Success" @close="showSuccessModal = false">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h3>{{ successMessage }}</h3>
      </div>

      <template #footer>
        <BaseButton @click="showSuccessModal = false"> Close </BaseButton>
      </template>
    </BaseModal>

    <!-- Error Modal -->
    <BaseModal v-model="showErrorModal" title="Error" @close="showErrorModal = false">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h3>{{ errorMessage }}</h3>
      </div>

      <template #footer>
        <BaseButton @click="showErrorModal = false"> Close </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useLogbookStore } from '@/stores/logbook'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const logbookStore = useLogbookStore()

// Settings state
const settings = reactive({
  theme: 'light',
  defaultCategory: '',
  entriesPerPage: 10,
  autoSave: false,
})

// Modal states
const showClearDataModal = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Operation states
const exporting = reactive({
  json: false,
  csv: false,
})
const importing = ref(false)
const clearing = ref(false)

// Clear data confirmation
const confirmText = ref('')
const confirmError = ref('')

// File input reference
const fileInput = ref(null)

// Computed properties
const availableCategories = computed(() => logbookStore.categories)
const stats = computed(() => logbookStore.getStats)

// Methods
const saveSettings = () => {
  // In a real app, this would save to localStorage or send to API
  localStorage.setItem('logbook-settings', JSON.stringify(settings))
  showSuccess('Settings saved successfully!')
}

const loadSettings = () => {
  const saved = localStorage.getItem('logbook-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
}

const exportData = async (format) => {
  exporting[format] = true

  try {
    const entries = logbookStore.sortedEntries

    if (format === 'json') {
      const dataStr = JSON.stringify(entries, null, 2)
      downloadFile(dataStr, 'logbook-entries.json', 'application/json')
    } else if (format === 'csv') {
      const csvData = convertToCSV(entries)
      downloadFile(csvData, 'logbook-entries.csv', 'text/csv')
    }

    showSuccess(`Data exported successfully as ${format.toUpperCase()}!`)
  } catch (error) {
    showError(`Failed to export data: ${error.message}`)
  } finally {
    exporting[format] = false
  }
}

const convertToCSV = (entries) => {
  if (entries.length === 0) return ''

  const headers = ['Title', 'Description', 'Date', 'Category', 'Location', 'Weather', 'Tags']
  const csvRows = [headers.join(',')]

  entries.forEach((entry) => {
    const row = [
      `"${(entry.title || '').replace(/"/g, '""')}"`,
      `"${(entry.description || '').replace(/"/g, '""')}"`,
      entry.date ? new Date(entry.date).toISOString().split('T')[0] : '',
      `"${entry.category || ''}"`,
      `"${entry.location || ''}"`,
      `"${entry.weather || ''}"`,
      `"${(entry.tags || []).join('; ')}"`,
    ]
    csvRows.push(row.join(','))
  })

  return csvRows.join('\n')
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  importing.value = true

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!Array.isArray(data)) {
      throw new Error('Invalid file format. Expected an array of entries.')
    }

    // Validate and import entries
    let importedCount = 0
    for (const entry of data) {
      if (entry.title && entry.description && entry.date) {
        await logbookStore.createEntry({
          ...entry,
          id: undefined, // Let the store generate new IDs
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        importedCount++
      }
    }

    showSuccess(`Successfully imported ${importedCount} entries!`)

    // Clear the file input
    event.target.value = ''
  } catch (error) {
    showError(`Failed to import data: ${error.message}`)
  } finally {
    importing.value = false
  }
}

const cancelClearData = () => {
  showClearDataModal.value = false
  confirmText.value = ''
  confirmError.value = ''
}

const confirmClearData = async () => {
  if (confirmText.value !== 'DELETE') {
    confirmError.value = 'Please type "DELETE" to confirm'
    return
  }

  clearing.value = true

  try {
    // Clear all entries
    const entries = [...logbookStore.sortedEntries]
    for (const entry of entries) {
      await logbookStore.deleteEntry(entry.id)
    }

    // Clear settings
    localStorage.removeItem('logbook-settings')

    showClearDataModal.value = false
    showSuccess('All data has been cleared successfully!')

    // Reset form
    confirmText.value = ''
    confirmError.value = ''
  } catch (error) {
    showError(`Failed to clear data: ${error.message}`)
  } finally {
    clearing.value = false
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  showSuccessModal.value = true
}

const showError = (message) => {
  errorMessage.value = message
  showErrorModal.value = true
}

onMounted(() => {
  logbookStore.initializeStore()
  loadSettings()
})
</script>

<style scoped>
.settings-view {
  width: 100%;
  max-width: 1000px;
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section .card-content {
  padding: 0;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger-item {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.setting-info {
  flex: 1;
  margin-right: 16px;
}

.setting-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.setting-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.setting-select {
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  min-width: 120px;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.setting-actions {
  display: flex;
  gap: 8px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.about-content {
  padding: 24px;
  text-align: center;
}

.about-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.about-content p {
  margin: 0 0 8px 0;
  color: #6b7280;
}

.about-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.about-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.about-link:hover {
  text-decoration: underline;
}

.danger-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
  gap: 16px;
}

.danger-icon {
  font-size: 48px;
}

.danger-modal-content h3 {
  margin: 0;
  color: #dc2626;
  font-size: 20px;
}

.danger-modal-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
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
  margin: 0;
  color: #059669;
  font-size: 18px;
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
  margin: 0;
  color: #dc2626;
  font-size: 18px;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-content h1 {
    font-size: 24px;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .setting-info {
    margin-right: 0;
  }

  .setting-actions {
    justify-content: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
