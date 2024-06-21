<template>
    <div :class="className">
        <slot name="header">
            <div v-if="title || info || $slots.title" class="mb-4">
                <h2 v-if="title || $slots.title" class="text-900 font-semibold text-lg m-0 p-0"><slot name="title">{{ title }}</slot></h2>
                <div v-if="info" class="mt-1 text-sm">{{ info }}</div>
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
        default: 'border bg-surface-50 dark:bg-surface-900 border-surface rounded',
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