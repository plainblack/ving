<template>
    <ul class="list-none m-0 p-0 flex flex-wrap lg:flex-col justify-evenly md:justify-between">
        <li v-for="item in links" :key="item.label" :title="item.label">
            <NuxtLink :to="item.to"
                :class="[route.path == item.to ? 'text-primary hover:bg-primary-reverse hover:text-primary' : 'text-color-secondary hover:bg-primary-reverse hover:text-color', 'flex items-center cursor-pointer p-0 py-2 rounded text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple']"
                :aria-current="route.path == item.to ? 'page' : undefined">
                <Icon :name="item.icon" aria-hidden="true" 
                    :class="[route.path == item.to ? 'text-primary group-hover:text-primary' : 'text-color-secondary group-hover:text-color', 'md:mr-2']" />
                <span class="font-medium hidden md:block text-nowrap">{{ item.label }}</span>
            </NuxtLink>
        </li>
        <li v-if="links.length && buttons.length"><hr class="mt-2 mb-3 border-50 hidden lg:block"></li>
        <li v-for="item in buttons" :key="item.label" class="lg:mb-2 p-fluid">
            <Button @mousedown="takeAction($event, item)" :severity="item.severity" :title="item.label">
                <Icon :name="item.icon" class="mr-1" /> <span class="hidden md:block text-nowrap">{{ item.label }}</span>
            </Button>
        </li>
    </ul>
</template>

<script setup>
import {z} from 'zod';
const route = useRoute();
const props = defineProps({
    links: {
        type: Array,
        default : () => [],
        validator : (value) => z.object({
                    label: z.string().min(1),
                    to: z.string().min(1),
                    icon: z.string().min(1),
                }).strict().array().safeParse(value).success,
    },
    buttons: {
        type: Array,
        default : () => [],
        validator : (value) => z.object({
                    label: z.string().min(1),
                    to: z.string().min(1).optional(),
                    action: z.function().optional(),
                    icon: z.string().min(1),
                    severity: z.enum(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'help', 'contrast'])
                }).strict().array().safeParse(value).success,
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
</script>