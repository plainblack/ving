<template>
    <label v-if="label" :for="id" class="block font-medium text-900 mb-2">{{ label }}</label>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label?: string,
        id?: string,
    }>(),
    {
    }
);
</script>
