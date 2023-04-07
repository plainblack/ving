<template>
    <Breadcrumb :model="props.crumbs">
        <template #item="{ item }">
            <NuxtLink :to="item.to">
                {{ item.label }}
            </NuxtLink>
        </template>
    </Breadcrumb>
</template>

<script setup lang="ts">

const props = withDefaults(
    defineProps<{
        crumbs: { label: string, to?: string }[],
    }>(),
    {

    }
);

</script>