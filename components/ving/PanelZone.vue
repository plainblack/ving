<template>
    <div :class="className">
        <slot name="header">
            <div v-if="title || info || $slots.title" class="mb-4">
                <h2 v-if="title || $slots.title" class="text-900 font-semibold text-lg m-0 p-0"><slot name="title">{{ title }}</slot></h2>
                <div v-if="info" class="mt-1 text-sm text-gray-500">{{ info }}</div>
            </div>
        </slot>

        <slot></slot>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default : '',
    },
    info: {
        type: String,
        default : '',
    },
    look: {
        type: String,
        default: 'surface-card border-1 surface-border border-round',
    },
    padding: {
        type: String,
        default: 'p-4 pt-3',
    },
    margin: {
        type: String,
        default: 'mb-4',
    }
});

const className = computed(() => [props.look, props.padding, props.margin].join(' '));
</script>