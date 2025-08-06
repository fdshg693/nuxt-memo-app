<template>
    <div class="mb-3">
        <select v-model="selectedPrompt" @change="handleChange" class="w-full border rounded p-2">
            <option v-for="option in promptOptions" :key="option.display" :value="option.customPrompt">
                {{ option.display }}
            </option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import { promptOptions } from './constants/aiPromptOptions'

const props = defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const selectedPrompt = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
    selectedPrompt.value = newValue
})

function handleChange() {
    emit('update:modelValue', selectedPrompt.value)
}
</script>