<template>
  <div class="date-picker">
    <label v-if="label" :for="inputId" class="date-picker-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <input
      :id="inputId"
      :value="formattedValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      type="date"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />

    <div v-if="error" class="date-picker-error">{{ error }}</div>
    <div v-else-if="hint" class="date-picker-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: '',
  },
  label: String,
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
  hint: String,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = ref(`date-picker-${Math.random().toString(36).substr(2, 9)}`)

const formattedValue = computed(() => {
  if (!props.modelValue) return ''

  if (props.modelValue instanceof Date) {
    return props.modelValue.toISOString().split('T')[0]
  }

  return props.modelValue
})

const inputClasses = computed(() => {
  const classes = ['date-picker-input']

  if (props.error) {
    classes.push('date-picker-input-error')
  }

  if (props.disabled) {
    classes.push('date-picker-input-disabled')
  }

  return classes.join(' ')
})

const handleInput = (event) => {
  const value = event.target.value

  if (value) {
    const date = new Date(value)
    emit('update:modelValue', date)
  } else {
    emit('update:modelValue', null)
  }
}
</script>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-picker-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.date-picker-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background-color: white;
}

.date-picker-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.date-picker-input-error {
  border-color: #ef4444;
}

.date-picker-input-error:focus {
  border-color: #ef4444;
}

.date-picker-input-disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.date-picker-error {
  color: #ef4444;
  font-size: 14px;
}

.date-picker-hint {
  color: #6b7280;
  font-size: 14px;
}
</style>
