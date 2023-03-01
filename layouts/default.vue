<template>
    <div>
        <div class="bg-gray-900 py-3 px-3 md:px-6 shadow-2 flex align-items-center justify-content-between relative lg:static border-bottom-1 border-gray-800"
            style="min-height: 84px">
            <img :src="config.public.logoUrl" :alt="config.public.companyName" height="40" class="mr-0 lg:mr-6">
            <a v-ripple class="cursor-pointer block lg:hidden text-gray-400 p-ripple"
                v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
                <i class="pi pi-bars text-4xl"></i>
            </a>
            <div
                class="align-items-center flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full bg-gray-900 left-0 top-100 z-1 shadow-2 lg:shadow-none border-1 lg:border-none border-gray-800">
                <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                    <li>
                        <NuxtLink to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                            <i class="pi pi-home mr-2"></i>
                            <span>Home</span>
                        </NuxtLink>
                    </li>

                    <li>
                        <a to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple"
                            v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true }">
                            <i class="pi pi-users mr-2"></i>
                            <span>Customers</span>
                            <i class="pi pi-angle-down ml-auto lg:ml-3"></i>
                        </a>
                        <ul
                            class="list-none py-3 px-6 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:shadow-2 lg:absolute bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer lg:border-1 border-gray-800">
                            <li>
                                <NuxtLink to="/" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <i class="pi pi-user-plus mr-2"></i>
                                    <span class="font-medium">Add New</span>
                                </NuxtLink>
                            </li>
                            <li class="relative">
                                <NuxtLink to="/" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple"
                                    v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true }">
                                    <i class="pi pi-search mr-2"></i>
                                    <span class="font-medium">Search</span>
                                    <i class="pi pi-angle-down ml-auto lg:-rotate-90"></i>
                                </NuxtLink>
                                <ul
                                    class="list-none py-3 pl-3 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:shadow-2 lg:absolute bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer left-100 top-0 lg:border-1 border-gray-800">
                                    <li>
                                        <NuxtLink to="/" v-ripple
                                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                            <i class="pi pi-shopping-cart mr-2"></i>
                                            <span class="font-medium">Purchases</span>
                                        </NuxtLink>
                                    </li>
                                    <li class="relative">
                                        <NuxtLink to="/" v-ripple
                                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                            <i class="pi pi-comments mr-2"></i>
                                            <span class="font-medium">Messages</span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <NuxtLink to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                            <i class="pi pi-calendar mr-2"></i>
                            <span>Calendar</span>
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                            <i class="pi pi-chart-line mr-2"></i>
                            <span>Stats</span>
                        </NuxtLink>
                    </li>
                </ul>
                <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                    <li class="flex-order-2 lg:flex-order-0">
                        <div class="flex px-6 p-3 lg:px-3 lg:py-2">
                            <span class="p-input-icon-left w-full">
                                <i class="pi pi-search text-gray-400"></i>
                                <InputText type="text" placeholder="Search"
                                    class="bg-gray-800 text-gray-400 border-gray-800 w-full" />
                            </span>
                        </div>
                    </li>
                    <li>
                        <NuxtLink to="/user/login" v-ripple
                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                            Sign In
                        </NuxtLink>
                    </li>
                    <li v-if="currentUserStore.currentUser">
                        <img :src="currentUserStore.currentUser.props.avatarUrl" class="mr-3 lg:mr-0"
                            style="width: 32px; height: 32px" />
                        <div class="block lg:hidden">
                            <div class="text-white font-medium">{{ currentUserStore.currentUser.props.displayName }}
                            </div>
                        </div>
                        <ul
                            class="list-none py-3 px-6 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:shadow-2 lg:absolute bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer lg:border-1 border-gray-800">
                            <li>
                                <NuxtLink :to="'/user/profile/' + currentUserStore.currentUser.props.id" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <i class="pi pi-user-plus mr-2"></i>
                                    <span class="font-medium">View profile</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/user/settings" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <i class="pi pi-search mr-2"></i>
                                    <span class="font-medium">Settings</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/user/logout" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <i class="pi pi-search mr-2"></i>
                                    <span class="font-medium">Sign out</span>
                                </NuxtLink>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <div class="px-0 py-4 md:px-5">
            <div class="p-3" style="min-height: 20rem">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const currentUserStore = useCurrentUserStore();
await currentUserStore.isAuthenticated();
</script>