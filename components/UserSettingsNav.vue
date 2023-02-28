<template>
    <aside class="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
        <nav class="space-y-1">
            <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href"
                :class="[route.path == item.href ? 'bg-gray-50 text-indigo-700 hover:bg-white hover:text-indigo-700' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900', 'group flex items-center rounded-md px-3 py-2 text-sm font-medium']"
                :aria-current="route.path == item.href ? 'page' : undefined">
                <font-awesome-icon :icon="item.icon" aria-hidden="true"
                    :class="[route.path == item.href ? 'text-indigo-500 group-hover:text-indigo-500' : 'text-gray-400 group-hover:text-gray-500', '-ml-1 mr-3 h-6 w-6 flex-shrink-0']" />
                <span class="truncate">{{ item.name }}</span>
            </NuxtLink>
        </nav>
    </aside>
</template>

<script setup lang="ts">
//import { CreditCardIcon, KeyIcon, SquaresPlusIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
const route = useRoute();

const navigation = [
    { name: 'Profile', href: '/user/settings', icon: 'fa-solid fa-circle-user' },
    { name: 'Account', href: '/user/settings/account', icon: 'fa-solid fa-key' },
    { name: 'Preferences', href: '/user/settings/preferences', icon: 'fa-solid fa-sliders' },
]
</script>