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
import {z} from 'zod';

const props = defineProps({
    crumbs: {
        type: Array,
        required: true,
        validator : (value) => z.object({
                    label: z.string().min(1),
                    to: z.string().min(1),
                }).strict().array().safeParse(value).success,
    },
});

</script>