<script setup lang="ts">
// Zdefiniuj props z opcjonalnymi wartościami domyślnymi, jeśli chcesz
const props = defineProps<{
  modelValue: string
  placeholder?: string
  type?: string
  errorMessage?: string
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="w-full mb-2">
    <input
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :type="props.type ?? 'text'"
      :class="['input input-bordered w-full', { 'input-error': props.error }]"
      @input="onInput"
    />
    <p v-if="props.errorMessage !== undefined" class="text-red-500 text-sm mt-1">{{ props.errorMessage }}</p>
  </div>
</template>

<style scoped></style>
