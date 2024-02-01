<template>
    <Breadcrumb :model="props.crumbs">
        <template #item="{ item }">
            <NuxtLink :to="item.to">
                {{ item.label }}
            </NuxtLink>
        </template>
    </Breadcrumb>
</template>

<script setup>

const props = defineProps({
    crumbs: Object,
});

</script>