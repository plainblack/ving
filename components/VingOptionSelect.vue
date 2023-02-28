<template>
    <label v-if="label" :for="computedId" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <select v-model="selected" :id="computedId" :name="name" v-bind="$attrs"
        class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
        <option v-for="option in options" :selected="selected === option.value" :value="option.value">
            {{ option.label }}
        </option>
    </select>
</template>

<script setup lang="ts">
import { TVingOption } from '~/app/db'
const props = withDefaults(
    defineProps<{
        label?: string,
        type?: 'text' | 'password' | 'number',
        name: string,
        id?: string,
        autocomplete?: string
        modelValue: string | number | undefined | null | boolean
        placeholder?: string
        options: TVingOption[] | undefined,
    }>(),
    {
        type: 'text',
        autocomplete: 'off'
    }
);

const computedId = props.id || props.name;
const emit = defineEmits(['update:modelValue'])

const selected = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})
</script>