<template>
    <label v-if="label" :for="id" class="block font-medium mb-2">{{ label }}</label>
</template>

<script setup>
const props = defineProps({
    label: String,
    id: String,
});
</script>
