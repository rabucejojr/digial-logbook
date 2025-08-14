<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-wrapper">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <div v-if="icon" class="input-icon">
        <slot name="icon">{{ icon }}</slot>
      </div>
    </div>

    <div v-if="error" class="input-error">{{ error }}</div>
    <div v-else-if="hint" class="input-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
  hint: String,
  icon: String,
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const classes = ['input']

  if (props.error) {
    classes.push('input-error-state')
  }

  if (props.disabled) {
    classes.push('input-disabled')
  }

  if (props.icon) {
    classes.push('input-with-icon')
  }

  return classes.join(' ')
})
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.input-wrapper {
  position: relative;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background-color: white;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-with-icon {
  padding-right: 40px;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.input-error-state {
  border-color: #ef4444;
}

.input-error-state:focus {
  border-color: #ef4444;
}

.input-disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input-error {
  color: #ef4444;
  font-size: 14px;
}

.input-hint {
  color: #6b7280;
  font-size: 14px;
}
</style>
