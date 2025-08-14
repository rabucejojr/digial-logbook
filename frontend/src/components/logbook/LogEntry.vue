<template>
  <BaseCard :variant="variant" class="log-entry">
    <template #header>
      <div class="log-entry-header">
        <div class="log-entry-meta">
          <h3 class="log-entry-title">{{ entry.title }}</h3>
          <div class="log-entry-date">{{ formattedDate }}</div>
        </div>
        <div v-if="showActions" class="log-entry-actions">
          <BaseButton variant="outline" size="small" @click="$emit('edit', entry)">
            Edit
          </BaseButton>
          <BaseButton variant="danger" size="small" @click="$emit('delete', entry)">
            Delete
          </BaseButton>
        </div>
      </div>
    </template>

          <div class="log-entry-content">
        <div class="log-entry-meta-row">
          <div v-if="entry.category" class="log-entry-category">
            <span class="category-badge">{{ entry.category }}</span>
          </div>
          <div v-if="entry.status" class="log-entry-status">
            <span class="status-badge" :class="`status-${entry.status.toLowerCase()}`">
              {{ entry.status }}
            </span>
          </div>
          <div v-if="entry.priority" class="log-entry-priority">
            <span class="priority-badge" :class="`priority-${entry.priority.toLowerCase()}`">
              {{ entry.priority }} Priority
            </span>
          </div>
        </div>

        <p class="log-entry-description">{{ entry.description }}</p>

        <div class="client-details">
          <div v-if="entry.contactPerson" class="client-detail">
            <i class="detail-icon">👤</i>
            <span class="detail-label">Contact Person:</span>
            <span class="detail-value">{{ entry.contactPerson }}</span>
          </div>

          <div v-if="entry.location" class="client-detail">
            <i class="detail-icon">📍</i>
            <span class="detail-label">Location:</span>
            <span class="detail-value">{{ entry.location }}</span>
          </div>

          <div v-if="entry.agency" class="client-detail">
            <i class="detail-icon">🏛️</i>
            <span class="detail-label">Agency:</span>
            <span class="detail-value">{{ entry.agency }}</span>
          </div>
        </div>

        <div v-if="entry.tags && entry.tags.length" class="log-entry-tags">
          <span v-for="tag in entry.tags" :key="tag" class="tag"> #{{ tag }} </span>
        </div>
      </div>

    <template v-if="showDetails" #footer>
      <div class="log-entry-details">
        <small class="log-entry-created"> Created: {{ formattedCreatedDate }} </small>
        <small v-if="entry.updatedAt" class="log-entry-updated">
          Updated: {{ formattedUpdatedDate }}
        </small>
      </div>
    </template>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'elevated',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['edit', 'delete'])

const formattedDate = computed(() => {
  if (!props.entry.date) return ''
  const date = new Date(props.entry.date)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedCreatedDate = computed(() => {
  if (!props.entry.createdAt) return ''
  return new Date(props.entry.createdAt).toLocaleString()
})

const formattedUpdatedDate = computed(() => {
  if (!props.entry.updatedAt) return ''
  return new Date(props.entry.updatedAt).toLocaleString()
})
</script>

<style scoped>
.log-entry {
  margin-bottom: 16px;
}

.log-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.log-entry-meta {
  flex: 1;
}

.log-entry-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.log-entry-date {
  color: #6b7280;
  font-size: 14px;
}

.log-entry-actions {
  display: flex;
  gap: 8px;
}

.log-entry-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-entry-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.log-entry-category {
  display: flex;
  gap: 8px;
}

.category-badge {
  background-color: #1e3a8a;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-high {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.priority-medium {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.priority-low {
  background-color: #f0f9ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
}

.log-entry-description {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

.log-entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #1e3a8a;
}

.client-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 120px;
}

.detail-value {
  color: #1f2937;
  flex: 1;
}

.log-entry-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #9ca3af;
  font-size: 12px;
}
</style>
