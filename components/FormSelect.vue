<template>
    <FormLabel :label="label" :id="computedId" />
    <select v-model="selected" :id="computedId" :name="name" :required="required" :class="fieldClass">
        <slot name="prepend"></slot>
        <option v-for="option in options" :selected="selected === option.value" :value="option.value">
            {{ option.label }}
        </option>
        <slot name="append"></slot>
    </select>
    <small :class="invalid ? 'text-red-500' : ''" v-if="invalid">{{ invalidReason }}</small>
</template>

<script setup>
import _ from 'lodash';

const props = defineProps({
    label: String,
    name: {
        type: String,
        required: true,
    },
    required: {
        type: Boolean,
        default: () => false,
    },
    id: String,
    modelValue: [String, Boolean, Number, null, undefined],
    options: [Array, undefined],
});

const displayName = props.label || props.name;

const computedId = props.id || props.name;
const emit = defineEmits(['update:modelValue', 'change']);

let invalidReason = '';

const invalidForm = inject('invalidForm', (a) => { });

const selected = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val);
        emit('change');
    }
});

const empty = computed(() => _.isNil(props.modelValue) || props.modelValue === '');

const invalid = computed(() => {
    if (props.required && empty.value) {
        invalidReason = `${displayName} is required.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    invalidForm([props.name, false]);
    return false;
});

const fieldClass = computed(() => invalid.value ? 'p-inputtext border-red-500 w-full' : 'p-inputtext w-full');

</script>

<style scoped>
select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 25 40'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 12px;
}
</style>