<template>
    <ul
        class="list-none m-0 p-0 flex flex-row lg:flex-column justify-content-evenly md:justify-content-between lg:justify-content-start mb-5 lg:pr-8 lg:mb-0">
        <template v-for="item in navigation" :key="item.name">
            <li
                v-if="!item.condition || (item.condition && currentUser.props && currentUser.props[item.condition] == true)">
                <NuxtLink :to="item.href" v-ripple
                    :class="[route.path == item.href ? 'bg-ground text-primary hover:bg-primary-reverse hover:text-primary' : 'text-color-secondary hover:bg-primary-reverse hover:text-color', 'flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple']"
                    :aria-current="route.path == item.href ? 'page' : undefined">
                    <i aria-hidden="true"
                        :class="[route.path == item.href ? 'text-primary group-hover:text-primary' : 'text-color-secondary group-hover:text-color', item.icon, 'md:mr-2']" />
                    <span class="font-medium hidden md:block">{{ item.name }}</span>
                </NuxtLink>
            </li>
        </template>
        <li class="mt-1">
            <hr class="mb-4 border-50" />
            <NuxtLink to="/user/logout" v-ripple>
                <Button>
                    <Icon name="fa6-solid:door-closed" class="mr-2" /> Sign Out
                </Button>
            </NuxtLink>
        </li>
    </ul>
</template>

<script setup>
const route = useRoute();
const currentUser = useCurrentUserStore();

const navigation = [
    { name: 'Profile', href: '/user/settings', icon: 'pi pi-user' },
    { name: 'Account', href: '/user/settings/account', icon: 'pi pi-key' },
    { name: 'Preferences', href: '/user/settings/preferences', icon: 'pi pi-sliders-h' },
    { name: 'API Keys', href: '/user/settings/apikeys', icon: 'pi pi-unlock', condition: 'developer' },
    { name: 'Admin', href: '/user/admin', icon: 'pi pi-users', condition: 'admin' },
]
</script>