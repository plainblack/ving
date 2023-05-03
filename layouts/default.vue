<template>
    <div>
        <div class="bg-gray-900 px-3 md:px-5 border-1 surface-border flex align-items-center justify-content-between relative lg:static border-bottom-1 border-gray-800"
            style="min-height: 84px">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="40" class="mr-0 lg:mr-6">
            <a v-ripple class="cursor-pointer block lg:hidden text-gray-400 p-ripple"
                v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
                <Icon name="prime:bars" class="text-4xl" />
            </a>
            <div
                class="align-items-center flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full bg-gray-900 left-0 top-100 z-1 border-1 surface-border lg:shadow-none border-1 lg:border-none border-gray-800">
                <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                    <li>
                        <NuxtLink to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                            <Icon name="prime:home" class="mr-2" />
                            <span>Home</span>
                        </NuxtLink>
                    </li>

                    <li>
                        <NuxtLink to="/ving" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                            <Icon name="prime:book" class="mr-2" />
                            <span>Ving Documentation</span>
                        </NuxtLink>
                    </li>

                    <li>
                        <NuxtLink to="/" v-ripple
                            class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple"
                            v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true }">
                            <Icon name="prime:building" class="mr-2" />
                            <span>Sample Dropdown</span>
                            <Icon name="prime:angle-down" class="ml-auto lg:ml-3" />
                        </NuxtLink>
                        <ul
                            class="list-none py-3 px-6 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:border-1 surface-border lg:absolute bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer lg:border-1 border-gray-800">
                            <li>
                                <NuxtLink to="/" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <Icon name="prime:thumbs-down" class="mr-2" />
                                    <span class="font-medium">Sample Submenu</span>
                                </NuxtLink>
                            </li>
                            <li class="relative">
                                <NuxtLink to="/" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple"
                                    v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true }">
                                    <Icon name="pixelarticons:avatar" class="mr-2" />
                                    <span class="font-medium">Sample 2</span>
                                    <Icon name="prime:sliders-h" class="ml-auto lg:-rotate-90" />
                                </NuxtLink>
                                <ul
                                    class="list-none py-3 pl-3 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:border-1 surface-border lg:absolute bg-gray-900 hidden origin-top w-full lg:w-15rem cursor-pointer left-100 top-0 lg:border-1 border-gray-800">
                                    <li>
                                        <NuxtLink to="/" v-ripple
                                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                            <Icon name="prime:comments" class="mr-2" />
                                            <span class="font-medium">Sample 3</span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
                <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                    <li class="flex-order-2 lg:flex-order-0">
                        <div class="flex px-6 p-3 lg:px-3 lg:py-2">
                            <span class="p-input-icon-left w-full">
                                <i class="pi pi-search" />
                                <InputText type="text" placeholder="Search (non-functional)"
                                    class="bg-gray-800 text-gray-400 border-gray-800 w-full" />
                            </span>
                        </div>
                    </li>
                    <li v-if="currentUser.props?.id">
                        <div class="flex align-items-center flex-wrap px-6 p-3 lg:px-3 lg:py-2 ml-6 lg:ml-0 text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors transition-duration-150 p-ripple"
                            v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: true }">

                            <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" shape="circle" />
                            <span class="text-white font-medium ml-2">
                                {{ currentUser.meta?.displayName }}
                            </span>
                            <Icon name="prime:angle-down" class="ml-auto lg:ml-3 mr-3 lg:mr-0" />
                        </div>
                        <ul
                            class="absolute right-0 list-none py-3 px-6 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:border-1 surface-border lg:absolute bg-gray-900 hidden origin-top w-full lg:w-12rem cursor-pointer z-5 lg:border-1 border-gray-800">
                            <li>
                                <NuxtLink to="/admin" v-ripple v-if="currentUser.props.admin"
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <Icon name="prime:user-plus" class="mr-2" />
                                    <span class="font-medium">Admin</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/user/settings" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <Icon name="fa6-solid:sliders" class="mr-2" />
                                    <span class="font-medium">Settings</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/user/logout" v-ripple
                                    class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                                    <Icon name="fa6-solid:door-closed" class="mr-2" />
                                    <span class="font-medium">Sign out</span>
                                </NuxtLink>
                            </li>
                        </ul>
                    </li>
                    <li v-else>
                        <NuxtLink to="/user/login" v-ripple
                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors transition-duration-150 p-ripple">
                            <Icon name="fa6-solid:door-open" class="mr-2" />
                            Sign In
                        </NuxtLink>
                    </li>

                </ul>
            </div>
        </div>
        <Message v-if="swa.message" :closable="false" :severity="swa.severity">{{ swa.message }}</Message>
        <div class="px-0 py-4 md:px-4">
            <div style="min-height: 20rem">
                <slot />
            </div>
        </div>
    </div>
    <Notify />
    <Throbber />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const currentUser = useCurrentUserStore();
await currentUser.isAuthenticated();
const swa = useSystemWideAlertStore();
onMounted(async () => {
    await swa.check();
})
</script>