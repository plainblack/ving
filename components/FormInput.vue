<template>
    <div :class="class">
        <label v-if="label" :for="computedId" class="block font-medium text-900 mb-1">{{ label }}</label>
        <InputNumber v-if="type == 'number' && (_.isNumber(val) || _.isNull(val) || _.isUndefined(val))" v-model="val"
            showButtons :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
            :required="required" :inputClass="fieldClass" v-bind="$attrs" />
        <Password v-else-if="type == 'password' && (_.isString(val) || _.isNull(val) || _.isUndefined(val))" v-model="val"
            toggleMask :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
            :required="required" :inputClass="fieldClass" v-bind="$attrs" class="w-full" />
        <TextArea v-else-if="type == 'textarea' && (_.isString(val) || _.isNull(val) || _.isUndefined(val))" v-model="val"
            :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete" :class="fieldClass"
            :required="required" v-bind="$attrs" />
        <InputText v-else-if="['text', 'email'].includes(type) && (_.isString(val) || _.isNull(val) || _.isUndefined(val))"
            v-model="val" :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
            :class="fieldClass" :required="required" v-bind="$attrs" />
        <Message v-else severity="error" :closable="false">
            Can't display {{ displayName }} Form Input
        </Message>
        <small :class="invalid && !empty ? 'text-red-500' : ''" v-if="invalid">{{ invalidReason }}</small>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash';

const props = withDefaults(
    defineProps<{
        label?: string,
        type?: 'textarea' | 'text' | 'password' | 'number' | 'email',
        name: string,
        id?: string,
        autocomplete?: string,
        modelValue: string | number | undefined | null,
        placeholder?: string,
        required?: boolean,
        mustMatch?: { field: string, value: string | number | undefined | null } | undefined,
        class?: string,
    }>(),
    {
        type: 'text',
        autocomplete: 'off',
        required: false,
        mustMatch: undefined,
    }
);
const computedId = props.id || props.name;

const emit = defineEmits(['update:modelValue']);

let invalidReason = '';

const invalidForm = inject('invalidForm', (a: ['', false]) => { }) as (a: [string, boolean, string?]) => void;

const empty = computed(() => _.isNil(props.modelValue) || props.modelValue === '');

const invalid = computed(() => {
    if (props.required && empty.value) {
        invalidReason = `${displayName} is required.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    else if (props.mustMatch !== undefined && props.mustMatch.value !== props.modelValue) {
        invalidReason = `${displayName} must match ${props.mustMatch.field}.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    else if (props.type == 'email' && !_.isNil(props.modelValue) && !(props.modelValue.toString().match(/.+@.+\..+/))) {
        invalidReason = `${displayName} doesn't look like an email address.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    invalidForm([props.name, false]);
    return false;
});

const fieldClass = computed(() => invalid.value && !empty.value ? 'p-invalid w-full' : 'w-full');

const displayName = props.label || props.name;


const val = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
});

</script>