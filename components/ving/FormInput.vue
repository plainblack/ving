<template>
    <div :class="class">
        <FormLabel :label="label" :id="computedId" />
        <div :class="append || prepend || $slots.prepend || $slots.append ? 'p-inputgroup flex-1' : 'flex-1'">
            <span v-if="$slots.prepend || prepend" class="p-inputgroup-addon"><slot name="prepend">{{ prepend }}</slot></span>
            <InputNumber v-if="type == 'number' && (isNumber(val) || isNull(val) || isUndefined(val))"
                v-model="val" showButtons :placeholder="placeholder" :name="name" :id="computedId"
                :autocomplete="autocomplete" :required="required" :inputClass="fieldClass" :step="step"
                :incrementButtonClass="append ? 'border-noround' : ''" @change="emit('change')"
                :decrementButtonClass="append ? 'border-noround' : ''" />
            <InputSwitch v-else-if="type == 'switch' && (isBoolean(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :name="name" :id="computedId"
                :inputClass="fieldClass" @change="emit('change')"
                 />
            <Password v-else-if="type == 'password' && (isString(val) || isNull(val) || isUndefined(val))" @change="emit('change')"
                v-model="val" toggleMask :placeholder="placeholder" :name="name" :id="computedId" :feedback="false"
                :autocomplete="autocomplete" :required="required" :inputClass="fieldClass" class="w-full" />
            <Textarea v-else-if="type == 'textarea' && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
                :class="fieldClass + ' border-round'" :required="required" autoResize @change="emit('change')" />
            <MarkdownInput v-else-if="type == 'markdown' && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :id="computedId" @change="emit('change')"
                />
            <Dropdown v-else-if="type == 'select'" :placeholder="placeholder"
                v-model="val" :name="name" :id="computedId" :options="modifiedOptions" :class="fieldClass" :required="required"
                @change="emit('change')" optionLabel="label" optionValue="value" />  
            <InputText
                v-else-if="['text', 'email'].includes(type) && (isString(val) || isNull(val) || isUndefined(val))"
                v-model="val" :placeholder="placeholder" :name="name" :id="computedId" :autocomplete="autocomplete"
                :class="fieldClass" :required="required" @change="emit('change')" />
            <Message v-else severity="error" :closable="false">
                Can't display {{ displayName }} Form Input
                {{ val }}
            </Message>
            <span v-if="$slots.append || append" class="p-inputgroup-addon"><slot name="append">{{ append }}</slot></span>
        </div>
        <small :class="invalid && !empty ? 'text-red-500' : ''" v-if="subtext">{{ subtext }}</small>
    </div>
</template>

<script setup>
import {isNumber, isString, isNull, isUndefined, isNil, isBoolean} from '#ving/utils/identify.mjs';


const props = defineProps({
    label: String,
    type: {
        type: String,
        default: () => 'text',
        validator(value, props) {
            return ['textarea', 'text', 'password', 'number', 'email','markdown','select','switch'].includes(value)
        }
    },
    name: {
        type: String,
        required: true,
    },
    subtext: {
        type: String,
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
    coerce : {
        type: Function,
        default: (v) => v,
    }
});

const computedId = props.id || props.name;

const emit = defineEmits(['update:modelValue','change']);

let subtext = ref(props.subtext);

const invalidForm = inject('invalidForm', (a) => { });

const empty = computed(() => isNil(props.modelValue));

const modifiedOptions = computed(() => {
    if ( props.placeholder ) {
        return [
            { value: undefined, label : props.placeholder },
            ...props.options,
        ]
    }
    return props.options;
});

const invalid = computed(() => {
    if (props.required && empty.value) {
        subtext.value = `${displayName} is required.`;
        invalidForm([props.name, true, subtext.value]);
        return true;
    }
    else if (!isUndefined(props.mustMatch) && props.mustMatch.value !== props.modelValue) {
        subtext.value = `${displayName} must match ${props.mustMatch.field}.`;
        invalidForm([props.name, true, subtext.value]);
        return true;
    }
    else if (props.type == 'email' && !isNil(props.modelValue) && !(props.modelValue.toString().match(/.+@.+\..+/))) {
        subtext.value = `${displayName} doesn't look like an email address.`;
        invalidForm([props.name, true, subtext.value]);
        return true;
    }
    if (props.subtext)
        subtext.value = props.subtext;
    invalidForm([props.name, false]);
    return false;
});

const fieldClass = computed(() => {
    if (props.type == 'select')
        return invalid.value ? 'border-red-500 w-full' : 'w-full';
    return invalid.value && !empty.value ? 'p-invalid w-full' : 'w-full' 
});

const displayName = props.label || props.name;


const val = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        val = props.coerce(val);
        emit('update:modelValue', val);
    }
});

</script>