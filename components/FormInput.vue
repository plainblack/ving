<template>
    <div :class="class">
        <FormLabel :label="label" :id="computedId" />
        <div class="p-inputgroup flex-1">
            <span v-if="prepend" class="p-inputgroup-addon"> {{ prepend }} </span>
            <InputNumber v-if="type == 'number' && (isNumber(val) || isNull(val) || isUndefined(val))"
                v-model="val" showButtons :placeholder="placeholder" :name="name" :id="computedId"
                :autocomplete="autocomplete" :required="required" :inputClass="fieldClass" :step="step"
                :incrementButtonClass="append ? 'border-noround' : ''"
                :decrementButtonClass="append ? 'border-noround' : ''" />
            <Password v-else-if="type == 'password' && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" toggleMask :placeholder="placeholder" :name="name" :id="computedId" :feedback="false"
                :autocomplete="autocomplete" :required="required" :inputClass="fieldClass" class="w-full" />
            <Textarea v-else-if="type == 'textarea' && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
                :class="fieldClass + ' border-round'" :required="required" autoResize />
            <MarkdownInput v-else-if="type == 'markdown' && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :id="computedId" @change="emit('change')"
                />
            <SelectInput v-else-if="type == 'select'"
                v-model="val" :name="name" :id="computedId" :options="options" :class="fieldClass" :required="required"
                @change="emit('change')">
                <template v-for="(_, name) in $slots" v-slot:[name]="slotData"><slot :name="name" v-bind="slotData" /></template>
            </SelectInput>
            <InputText
                v-else-if="['text', 'email'].includes(type) && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
                :class="fieldClass" :required="required" />
            <Message v-else severity="error" :closable="false">
                Can't display {{ displayName }} Form Input
            </Message>
            <span v-if="append" class="p-inputgroup-addon"> {{ append }} </span>
        </div>
        <small :class="invalid && !empty ? 'text-red-500' : ''" v-if="invalid">{{ invalidReason }}</small>
    </div>
</template>

<script setup>
import {isNumber, isString, isNull, isUndefined, isNil} from '#ving/utils/identify.mjs';


const props = defineProps({
    label: String,
    type: {
        type: String,
        default: () => 'text',
        validator(value, props) {
            return ['textarea', 'text', 'password', 'number', 'email','markdown','select'].includes(value)
        }
    },
    name: {
        type: String,
        required: true,
    },
    id: String,
    append: String,
    prepend: String,
    autocomplete: {
        type: String,
        default: () => 'off',
    },
    modelValue: {
        required: true,
    },
    placeholder: String,
    required: {
        type: Boolean,
        default: () => false,
    },
    step: {
        type: Number,
        default: () => 1,
    },
    mustMatch: {
        type: [Object, undefined],
        default: () => undefined,
    },
    options: [Array, undefined],
    class: String,
});

const computedId = props.id || props.name;

const emit = defineEmits(['update:modelValue','change']);

let invalidReason = '';

const invalidForm = inject('invalidForm', (a) => { });

const empty = computed(() => isNil(props.modelValue));

const invalid = computed(() => {
    if (props.required && empty.value) {
        invalidReason = `${displayName} is required.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    else if (!isUndefined(props.mustMatch) && props.mustMatch.value !== props.modelValue) {
        invalidReason = `${displayName} must match ${props.mustMatch.field}.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    else if (props.type == 'email' && !isNil(props.modelValue) && !(props.modelValue.toString().match(/.+@.+\..+/))) {
        invalidReason = `${displayName} doesn't look like an email address.`;
        invalidForm([props.name, true, invalidReason]);
        return true;
    }
    invalidForm([props.name, false]);
    return false;
});

const fieldClass = computed(() => {
    if (props.type == 'select')
        return invalid.value ? 'p-inputtext border-red-500 w-full' : 'p-inputtext w-full';
    return invalid.value && !empty.value ? 'p-invalid w-full' : 'w-full' 
});

const displayName = props.label || props.name;


const val = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emit('update:modelValue', val);
    }
});

</script>