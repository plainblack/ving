<template>
    <Button v-if="items.length == 1" @mousedown="takeAction($event, firstItem)" :severity="severity" class="white-space-nowrap">
        <Icon :name="firstItem.icon" class="mr-1 vertical-align-middle" />
        <span class="vertical-align-middle">{{ firstItem.label }}</span>
    </Button>
    <SplitButton v-else-if="items.length > 1" :severity="severity" :model="otherItems" @mousedown="takeAction($event, firstItem)" class="white-space-nowrap">
        <span>
            <Icon :name="firstItem.icon" :title="firstItem.label" class="mr-1 vertical-align-middle" />
            <span class="vertical-align-middle">{{ firstItem.label }}</span>
        </span>
        <template #item="{ item }">
            <span @mousedown="takeAction($event, item)" class="flex p-2 align-items-center" :title="item.label">
                <Icon :name="item.icon" class="mr-1" />
                {{ item.label }}
            </span>
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
    const takeAction = async (e,item) => {
        if (item.to) {
            await navigateTo(item.to);
        }
        else {
            await item.action(e);
        }
    }
    const firstItem = computed(() => props.items[0] || {});
    const otherItems = computed(() => props.items.filter((e, i) => i != 0) || []);
</script>