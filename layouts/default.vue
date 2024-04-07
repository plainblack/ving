<template>
    <div>
        <client-only>
            <Menubar :model="topNav" class="bg-gray-900">
                <template #start>
                    <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="40"
                        class="mr-0 lg:mr-6">
                </template>
                <template #item="{ item, props, hasSubmenu, root }">
                    <a v-if="hasSubmenu" v-ripple :target="item.target" v-bind="props.action"
                        class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center bg-gray-900 font-medium border-round cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800">
                        <Icon :name="item.icon" class="mr-2" />
                        <span class="ml-2">{{ item.label }}</span>
                        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
                    </a>
                    <NuxtLink v-else :to="item.to" v-ripple
                        class="flex px-6 p-3 lg:px-3 lg:py-2 bg-gray-900 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 font-medium border-round cursor-pointer">
                        <Icon :name="item.icon" class="mr-2" />
                        <span>{{ item.label }}</span>
                    </NuxtLink>
                </template>

                <template #end>
                    <div class="flex align-items-center gap-2">
                        <InputGroup class="border-secondary">
                            <InputGroupAddon class="bg-gray-900 border-primary">
                                <i class="pi pi-search" />
                            </InputGroupAddon>
                            <InputText placeholder="Search (non-functional)" type="text"
                                class="w-8rem sm:w-auto bg-gray-900 text-white border-primary" />
                        </InputGroup>
                        <SplitButton v-if="currentUser.props?.id" :model="userMenu" text>
                            <NuxtLink to="/user/settings" v-ripple class="flex align-items-center">
                                <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" shape="circle" />
                                <span class="text-white ml-2">
                                    {{ currentUser.meta?.displayName }}
                                </span>
                            </NuxtLink>
                            <template #item="{ item }">
                                <NuxtLink :to="item.to" v-ripple class="flex p-3 align-items-center">
                                    <Icon :name="item.icon" class="mr-2" />
                                    {{ item.label }}
                                </NuxtLink>
                            </template>
                        </SplitButton>
                        <NuxtLink v-else to="/user/login" v-ripple style="min-width: 120px;"
                            class="flex p-3 align-items-center text-gray-400 hover:text-white hover:bg-gray-800 no-underline">
                            <Icon name="fa6-solid:door-open" class="mr-2" />
                            Sign In
                        </NuxtLink>
                    </div>
                </template>
            </Menubar>
        </client-only>

        <client-only>
            <SystemWideAlert />
        </client-only>
        <div class="px-0 py-4 md:px-4">
            <div style="min-height: 20rem">
                <slot />
            </div>
        </div>
    </div>
    <client-only>
        <Notify />
        <Throbber />
    </client-only>
</template>

<script setup>
const config = useRuntimeConfig();
const currentUser = useCurrentUserStore();
await currentUser.isAuthenticated();
onMounted(async () => {
    // subscribe to message bus
    useMessageBus();
})
const topNav = [
    { label: 'Home', to: '/', icon: 'prime:home' },
    { label: 'Ving Documentation', to: 'https://plainblack.github.io/ving/', icon: "prime:book" },
    {
        label: 'Sample Dropdown', icon: "prime:thumbs-down", items: [
            { label: 'Sample 1', to: '#', icon: 'pixelarticons:avatar' },
            { label: 'Sample 2', to: '#', icon: 'prime:sliders-h' },

        ]
    },
]

const userMenu = computed(() => {
    const out = [
        { label: 'Settings', to: '/user/settings', icon: 'fa6-solid:sliders' },
        { label: 'Sign Out', to: '/user/logout', icon: 'fa6-solid:door-closed' },
    ];
    if (currentUser.props.admin)
        out.unshift({ label: 'Admin', to: '/admin', icon: 'prime:user-plus' });
    return out;
})
</script>