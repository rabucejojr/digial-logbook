<template>
  <div class="textarea-group">
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="textareaClasses"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    ></textarea>

    <div v-if="error" class="textarea-error">{{ error }}</div>
    <div v-else-if="hint" class="textarea-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: String,
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
  hint: String,
  rows: {
    type: Number,
    default: 4,
  },
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaId = ref(`textarea-${Math.random().toString(36).substr(2, 9)}`)

const textareaClasses = computed(() => {
  const classes = ['textarea']

  if (props.error) {
    classes.push('textarea-error-state')
  }

  if (props.disabled) {
    classes.push('textarea-disabled')
  }

  return classes.join(' ')
})
</script>

<style scoped>
.textarea-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.textarea-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  background-color: white;
  resize: vertical;
  min-height: 80px;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.textarea-error-state {
  border-color: #ef4444;
}

.textarea-error-state:focus {
  border-color: #ef4444;
}

.textarea-disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  resize: none;
}

.textarea-error {
  color: #ef4444;
  font-size: 14px;
}

.textarea-hint {
  color: #6b7280;
  font-size: 14px;
}
</style>
