<template>
    <div class="surface-card p-4 pt-3 border-1 surface-border border-round mb-4">
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
});
</script>