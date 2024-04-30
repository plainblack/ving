<template>
    <label v-if="label" :for="id" class="block font-medium text-900 mb-2">{{ label }}</label>
</template>

<script setup>
const props = defineProps({
    label: String,
    id: String,
});
</script>
