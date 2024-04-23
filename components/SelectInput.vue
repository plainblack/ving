<template>
    <select v-model="selected" :id="id" :required="required" :class="fieldClass">
        <slot name="prepend"></slot>
        <option v-for="option in options" :selected="selected === option.value" :value="option.value">
            {{ option.label }}
        </option>
        <slot name="append"></slot>
    </select>
</template>

<script setup>
import _ from 'lodash';

const props = defineProps({
    id: {
        required: true,
    },
    required: {
        type: Boolean,
        default: () => false,
    },
    modelValue: [String, Boolean, Number, null, undefined],
    options: [Array, undefined],
    fieldClass : {
        type: String,
        default : 'p-inputtext w-full'
    },
});

const emit = defineEmits(['update:modelValue', 'change']);

const selected = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val);
        emit('change');
    }
});

</script>

<style scoped>
select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 40'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 12px;
}
</style>