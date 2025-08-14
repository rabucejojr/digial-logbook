<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <div class="card-content">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined'].includes(value),
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['none', 'small', 'normal', 'large'].includes(value),
  },
})

const cardClasses = computed(() => {
  const classes = ['card', `card-${props.variant}`, `card-padding-${props.padding}`]
  return classes.join(' ')
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card-default {
  border: 1px solid #e5e7eb;
}

.card-elevated {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-outlined {
  border: 2px solid #d1d5db;
}

.card-padding-none .card-content {
  padding: 0;
}

.card-padding-small .card-content {
  padding: 12px;
}

.card-padding-normal .card-content {
  padding: 16px;
}

.card-padding-large .card-content {
  padding: 24px;
}

.card-header {
  padding: 16px 16px 0 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.card-footer {
  padding: 0 16px 16px 16px;
  border-top: 1px solid #e5e7eb;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
