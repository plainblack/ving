<template>
    <Button v-if="items.length == 1 && firstItem.action" @click="firstItem.action" :severity="severity" class="white-space-nowrap">
        <Icon :name="firstItem.icon" class="mr-1 vertical-align-middle" />
        <span class="vertical-align-middle">{{ firstItem.label }}</span>
    </Button>
    <NuxtLink v-else-if="items.length == 1 && firstItem.to" :to="firstItem.to" v-ripple class="flex no-underline align-items-center">
        <Button :severity="severity" class="white-space-nowrap">
            <Icon :name="firstItem.icon" class="mr-1 vertical-align-middle" />
            <span class="vertical-align-middle">{{ firstItem.label }}</span>
        </Button>
    </NuxtLink>
    <SplitButton v-else-if="items.length > 1" :severity="severity" :model="otherItems" @click="firstItem.action" class="white-space-nowrap">
        <span v-if="firstItem.action">
            <Icon :name="firstItem.icon" :title="firstItem.label" class="mr-1 vertical-align-middle" />
            <span class="vertical-align-middle">{{ firstItem.label }}</span>
        </span>
        <NuxtLink v-else :to="firstItem.to" v-ripple class="flex no-underline text-white align-items-center" :title="firstItem.label">
            <Icon :name="firstItem.icon" class="mr-1 vertical-align-middle" />
            <span class="vertical-align-middle">{{ firstItem.label }}</span>
        </NuxtLink>
        <template #item="{ item }">
            <span v-if="item.action" @click="item.action" class="flex p-2 align-items-center" :title="item.label">
                <Icon :name="item.icon" class="mr-1" />
                {{ item.label }}
            </span>
            <NuxtLink v-else :to="item.to" v-ripple class="flex p-2 align-items-center" :title="item.label">
                <Icon :name="item.icon" class="mr-1" />
                    {{ item.label }}
            </NuxtLink>
        </template>
    </SplitButton>
    <Message v-else severity="error">You need to specify some items.</Message>
</template>

<script setup>
import {z} from 'zod';

    const props = defineProps({
        severity: {
            type: String,
            default: 'primary',
            validator : (value) => z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'help', 'contrast'])
                .safeParse(value).success
        },
        items: {
            type: Array,
            required: true,
            validator : (value) => z.object({
                    label: z.string().min(1),
                    to: z.string().min(1).optional(),
                    action: z.function().optional(),
                    icon: z.string().min(1),
                }).strict().array().safeParse(value).success
        },
    });
    const firstItem = computed(() => props.items[0] || {});
    const otherItems = computed(() => props.items.filter((e, i) => i != 0) || []);
</script>