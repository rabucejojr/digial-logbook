<template>
  <form @submit.prevent="handleSubmit" class="log-entry-form">
    <div class="form-grid">
              <!-- Title -->
        <BaseInput
          v-model="formData.title"
          label="Client/Project Name"
          placeholder="Enter client company name or project title"
          required
          :error="errors.title"
          class="form-field-full"
        />

      <!-- Date -->
      <BaseDatePicker
        v-model="formData.date"
        label="Date"
        required
        :error="errors.date"
        class="form-field"
      />

      <!-- Category -->
      <div class="form-field">
        <label class="input-label">Category</label>
        <select v-model="formData.category" class="category-select">
          <option value="">Select a category</option>
          <option v-for="category in availableCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <BaseInput
          v-if="showCustomCategory"
          v-model="customCategory"
          placeholder="Enter custom category"
          class="custom-category-input"
        />
        <BaseButton
          type="button"
          variant="outline"
          size="small"
          @click="toggleCustomCategory"
          class="add-category-btn"
        >
          {{ showCustomCategory ? 'Cancel' : 'Add New Category' }}
        </BaseButton>
      </div>

              <!-- Description -->
        <BaseTextarea
          v-model="formData.description"
          label="Project Description"
          placeholder="Describe the client's needs, project scope, and implementation details..."
          required
          :rows="6"
          :error="errors.description"
          class="form-field-full"
        />

        <!-- Contact Person -->
        <BaseInput
          v-model="formData.contactPerson"
          label="Contact Person"
          placeholder="Primary contact person and position"
          class="form-field"
        />

        <!-- Status -->
        <div class="form-field">
          <label class="input-label">Status</label>
          <select v-model="formData.status" class="status-select">
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Priority -->
        <div class="form-field">
          <label class="input-label">Priority Level</label>
          <select v-model="formData.priority" class="priority-select">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <!-- Agency -->
        <div class="form-field">
          <label class="input-label">Agency</label>
          <select v-model="formData.agency" class="agency-select">
            <option value="">Select Agency</option>
            <option value="MSME">MSME</option>
            <option value="Academe">Academe</option>
            <option value="NGA">NGA</option>
            <option value="DepED">DepED</option>
            <option value="Cooperatives">Cooperatives</option>
            <option value="LGU">LGU</option>
            <option value="Private Sector">Private Sector</option>
            <option value="Others">Others</option>
          </select>
        </div>

              <!-- Location -->
        <BaseInput
          v-model="formData.location"
          label="Client Location"
          placeholder="Client company address or meeting location"
          icon="📍"
          class="form-field-full"
        />

              <!-- Tags -->
        <div class="form-field-full">
          <label class="input-label">Technology Tags</label>
          <div class="tags-input-container">
            <input
              v-model="tagInput"
              placeholder="Add technology or industry tags (e.g., AI, IoT, manufacturing)"
              class="tag-input"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
            />
            <BaseButton type="button" variant="outline" size="small" @click="addTag">
              Add Tag
            </BaseButton>
          </div>
          <div v-if="formData.tags.length" class="tags-display">
            <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
              #{{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
            </span>
          </div>
        </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <BaseButton type="button" variant="outline" @click="$emit('cancel')"> Cancel </BaseButton>
      <BaseButton type="submit" :loading="loading" :disabled="!isFormValid">
        {{ isEditMode ? 'Update Entry' : 'Create Entry' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  availableCategories: {
    type: Array,
    default: () => [
      'Technology Transfer',
      "Laboratory Services",
      'Research Partnership',
      'Startup Incubation',
      'Innovation Support',
      'Consultancy Services',
      'Training Program',
      'Industry Collaboration',
      'Government Partnership'
    ],
  },
})

const emit = defineEmits(['submit', 'cancel'])

// Form data
const formData = reactive({
  title: '',
  description: '',
  date: new Date(),
  category: '',
  location: '',
  contactPerson: '',
  status: 'Active',
  priority: 'Medium',
  agency: '',
  tags: [],
})

// Form state
const errors = reactive({})
const tagInput = ref('')
const showCustomCategory = ref(false)
const customCategory = ref('')

// Computed properties
const isEditMode = computed(() => {
  return !!(props.initialData && props.initialData.id)
})

const isFormValid = computed(() => {
  return formData.title.trim() && formData.description.trim() && formData.date
})

// Methods
const toggleCustomCategory = () => {
  showCustomCategory.value = !showCustomCategory.value
  if (!showCustomCategory.value) {
    customCategory.value = ''
  }
}

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

const validateForm = () => {
  const newErrors = {}

  if (!formData.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Description is required'
  }

  if (!formData.date) {
    newErrors.date = 'Date is required'
  }

  Object.assign(errors, newErrors)

  return Object.keys(newErrors).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // Use custom category if provided
  if (showCustomCategory.value && customCategory.value.trim()) {
    formData.category = customCategory.value.trim()
  }

  const submitData = {
    ...formData,
    id: isEditMode.value ? props.initialData.id : undefined,
    createdAt: isEditMode.value ? props.initialData.createdAt : new Date(),
    updatedAt: new Date(),
  }

  emit('submit', submitData)
}

// Initialize form with existing data
const initializeForm = () => {
  if (props.initialData) {
          Object.assign(formData, {
        title: props.initialData.title || '',
        description: props.initialData.description || '',
        date: props.initialData.date ? new Date(props.initialData.date) : new Date(),
        category: props.initialData.category || '',
        location: props.initialData.location || '',
        contactPerson: props.initialData.contactPerson || '',
        status: props.initialData.status || 'Active',
        priority: props.initialData.priority || 'Medium',
        agency: props.initialData.agency || '',
        tags: props.initialData.tags ? [...props.initialData.tags] : [],
      })
  }
}

// Watch for changes in initial data
watch(() => props.initialData, initializeForm, { immediate: true })

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.log-entry-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.category-select,
.status-select,
.priority-select,
.agency-select {
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  transition: border-color 0.2s ease;
  width: 100%;
}

.category-select:focus,
.status-select:focus,
.priority-select:focus,
.agency-select:focus {
  outline: none;
  border-color: #1e3a8a;
}

.custom-category-input {
  margin-top: 8px;
}

.add-category-btn {
  margin-top: 8px;
  align-self: flex-start;
}

.tags-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.tag-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  background-color: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag-remove:hover {
  background-color: #d1d5db;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .tags-input-container {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
