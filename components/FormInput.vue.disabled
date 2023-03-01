<template>
    <label v-if="label" :for="computedId" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <input v-model="val" :placeholder="placeholder" :type="type" :name="name" :id="computedId" :autocomplete="autocomplete"
        v-bind="$attrs"
        class="block w-full min-w-0 flex-grow rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label?: string,
        type?: 'text' | 'password' | 'number',
        name: string,
        id?: string,
        autocomplete?: string
        modelValue: string | number | undefined | null
        placeholder?: string
    }>(),
    {
        type: 'text',
        autocomplete: 'off'
    }
);
const computedId = props.id || props.name;
/*
const emit = defineEmits(['update:modelValue'])

const updateValue = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
};
*/
/*
const emit = defineEmits(['update:modelValue'])

const model = computed({
    get() {
        return props.modelValue
    },

    set(value) {
        return emit('update:modelValue', value)
    }
})
*/

const emit = defineEmits(['update:modelValue'])

const val = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})


/*
function updateInput(event: Event) {
    this.$emit("update:modelValue", event.target.value);
}*/
</script>