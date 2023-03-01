<template>
    <label v-if="label" :for="computedId" class="block font-medium text-900 mb-2">{{ label }}</label>
    <select v-model="selected" :id="computedId" :name="name" v-bind="$attrs"
        class="p-inputtext"><!--p-dropdown-trigger-icon pi pi-chevron-down-->
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

<style scoped>
select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 40'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 12px;
}
</style>