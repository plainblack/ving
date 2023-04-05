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
import Breadcrumb from 'primevue/breadcrumb';

const props = withDefaults(
    defineProps<{
        crumbs: { label: string, to?: string }[],
    }>(),
    {

    }
);

</script>