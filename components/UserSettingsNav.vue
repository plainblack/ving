<template>
    <ul
        class="list-none m-0 p-0 flex flex-row lg:flex-column justify-content-evenly md:justify-content-between lg:justify-content-start mb-5 lg:pr-8 lg:mb-0">
        <li v-for="item in navigation" :key="item.name">
            <NuxtLink :to="item.href" v-ripple
                :class="[route.path == item.href ? 'bg-ground text-primary hover:bg-primary-reverse hover:text-primary' : 'text-color-secondary hover:bg-primary-reverse hover:text-color', 'flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple']"
                :aria-current="route.path == item.href ? 'page' : undefined">
                <i aria-hidden="true"
                    :class="[route.path == item.href ? 'text-primary group-hover:text-primary' : 'text-color-secondary group-hover:text-color', item.icon, 'md:mr-2']" />
                <span class="font-medium hidden md:block">{{ item.name }}</span>
            </NuxtLink>

        </li>
    </ul>
</template>

<script setup lang="ts">
const route = useRoute();

const navigation = [
    { name: 'Profile', href: '/user/settings', icon: 'pi pi-user' },
    { name: 'Account', href: '/user/settings/account', icon: 'pi pi-key' },
    { name: 'Preferences', href: '/user/settings/preferences', icon: 'pi pi-sliders-h' },
]
</script>