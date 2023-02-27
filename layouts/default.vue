<template>
    <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
        <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-16 items-center justify-between">
                <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    <!-- Mobile menu button-->
                    <DisclosureButton
                        class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span class="sr-only">Open main menu</span>
                        <font-awesome-icon icon="fa-solid fa-bars" v-if="!open" class="block h-6 w-6" aria-hidden="true" />
                        <font-awesome-icon icon="fa-solid fa-xmark" v-else class="block h-6 w-6" aria-hidden="true" />
                    </DisclosureButton>
                </div>
                <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div class="flex flex-shrink-0 items-center">
                        <NuxtLink to="/">
                            <img class="block h-8 w-auto lg:hidden" :src="config.public.logoUrl"
                                :alt="config.public.companyName" />
                            <img class="hidden h-8 w-auto lg:block" :src="config.public.logoUrl"
                                :alt="config.public.companyName" />
                        </NuxtLink>
                    </div>
                    <div class="hidden sm:ml-6 sm:block">
                        <div class="flex space-x-4">
                            <NuxtLink v-for="item in navigation" :key="item.name" :to="item.href"
                                :class="['text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium']">
                                {{ item.name }}</NuxtLink>
                        </div>
                    </div>
                </div>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <button type="button"
                        class="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span class="sr-only">View notifications</span>
                        <font-awesome-icon icon="fa-solid fa-bell" class="h-6 w-6" aria-hidden="true" />
                    </button>

                    <!-- Profile dropdown -->
                    <Menu as="div" class="relative ml-3">
                        <div>
                            <MenuButton v-if="currentUserStore.currentUser"
                                class="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-8 w-8 rounded-full"
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt="" />
                                <div class="m-2 text-white">
                                    {{ currentUserStore.currentUser && currentUserStore.currentUser.props.displayName }}
                                </div>
                            </MenuButton>
                            <NuxtLink v-else to="/user/login" type="button"
                                class="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span class="sr-only">Sign in to your account</span>
                                Sign In
                            </NuxtLink>
                        </div>
                        <transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <MenuItems
                                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <MenuItem v-slot="{ active }">
                                <a href="#"
                                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your
                                    Profile</a>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                <NuxtLink to="/user/login"
                                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                                    Settings</NuxtLink>
                                </MenuItem>
                                <MenuItem v-slot="{ active, close }">
                                <NuxtLink to="/user/logout" v-slot="{ navigate }" custom>
                                    <a @click="navigate(); close()"
                                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Sign
                                        out</a>
                                </NuxtLink>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
            </div>
        </div>

        <DisclosurePanel class="sm:hidden">
            <div class="space-y-1 px-2 pt-2 pb-3">
                <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href"
                    :class="['text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium']">
                    {{ item.name }}</DisclosureButton>
            </div>
        </DisclosurePanel>
    </Disclosure>


    <slot />
</template>

<script setup lang="ts">
import { useCurrentUserStore } from '~/stores/currentUserStore';

const config = useRuntimeConfig();
const navigation = [
    { name: 'Ving', href: '/' },
    { name: 'Team', href: '#' },
    { name: 'Projects', href: '#' },
    { name: 'Calendar', href: '#' },
]
useHead({
    bodyAttrs: {
        class: 'h-full',
    },
    htmlAttrs: {
        class: 'h-full bg-gray-50'
    },
});

const currentUserStore = useCurrentUserStore();
currentUserStore.fetch();
</script>