<template>
    <div>
        <Menubar id="topnav" :model="topNav" class="py-0">
            <template #start>
                <img :src="config.public.site.logoUrl" :alt="`${config.public.site.name} logo`" :title="config.public.site.name" class="h-10 mr-0 lg:mr-3">
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <a v-if="hasSubmenu" :target="item.target" v-bind="props.action"
                    class="flex items-center px-6 p-3 lg:px-3 lg:py-2 rounded cursor-pointer">
                    <Icon :name="item.icon" class="mr-2" />
                    <span class="ml-2">{{ item.label }}</span>
                    <Icon v-if="hasSubmenu" name="pepicons-pop:angle-down" class="ml-2"/>
                </a>
                <NuxtLink v-else :to="item.to"
                    class="flex items-center px-6 p-3 lg:px-3 lg:py-2 rounded cursor-pointer">
                    <Icon :name="item.icon" class="mr-2" />
                    <span>{{ item.label }}</span>
                </NuxtLink>
            </template>

            <template #end>
                <div class="flex items-center gap-2">
                    <DarkModeSelector/>               
                    <InputGroup>
                        <InputGroupAddon>
                            <Icon name="ion:search"/>
                        </InputGroupAddon>
                        <InputText placeholder="Search (non-functional)" type="text" class="w-8rem sm:w-auto" />
                    </InputGroup>
                    <SplitButton v-if="currentUser.props?.id" :model="userMenu" text>
                        <NuxtLink to="/user/settings" class="flex items-center">
                            <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" shape="circle" />
                            <span class="ml-2">
                                {{ currentUser.meta?.displayName }}
                            </span>
                        </NuxtLink>
                        <template #item="{ item }">
                            <NuxtLink :to="item.to" class="flex p-3 items-center">
                                <Icon :name="item.icon" class="mr-2" />
                                {{ item.label }}
                            </NuxtLink>
                        </template>
                    </SplitButton>
                    <NuxtLink v-else to="/user/login" class="flex p-3 items-center text-nowrap">
                        <Icon name="fa6-solid:door-open" class="mr-2" />
                        Sign In
                    </NuxtLink>
                </div>
            </template>
        </Menubar>

        <SystemWideAlert />
        <div class="px-0 py-1 md:px-4">
            <div style="min-height: 20rem">
                <slot />
            </div>
        </div>
    </div>
        <Notify />
        <Throbber />
</template>

<script setup>
const config = useRuntimeConfig();
const currentUser = useCurrentUser();
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