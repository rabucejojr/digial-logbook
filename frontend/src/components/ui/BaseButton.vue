<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="loading-spinner"></div>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'outline'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['btn', `btn-${props.variant}`, `btn-${props.size}`]

  if (props.disabled || props.loading) {
    classes.push('btn-disabled')
  }

  return classes.join(' ')
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
}

.btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Sizes */
.btn-small {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-medium {
  padding: 8px 16px;
  font-size: 16px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 18px;
}

/* Variants */
.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  background-color: #dc2626;
}

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: #3b82f6;
  color: white;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
