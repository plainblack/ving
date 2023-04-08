<template>
    <div class="surface-card border-1 surface-border border-round flex align-items-center justify-content-between relative lg:static p-2 pl-3 pr-3"
        :class="{ 'border-noround-bottom': crumbs }">
        <NuxtLink to="/admin" class="text-900 font-semibold no-underline text-lg mr-5">Admin</NuxtLink>
        <a v-ripple class="cursor-pointer block lg:hidden text-gray-400 p-ripple"
            v-styleclass="{ selector: '@next', enterClass: 'hidden', leaveToClass: 'hidden', hideOnOutsideClick: true }">
            <Icon name="prime:bars" class="text-4xl" />
        </a>
        <div
            class="align-items-center bg-white flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 top-100 border-1 surface-border lg:shadow-none border-1 lg:border-none">
            <ul class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row">
                <li>
                    <NuxtLink to="/user/admin" v-ripple
                        class="flex px-6 p-3 lg:px-3 lg:py-2 align-items-center text-gray-500 hover:bg-gray-200 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple">
                        Users
                    </NuxtLink>
                </li>
            </ul>
        </div>
    </div>
    <Crumbtrail v-if="crumbs" :crumbs="crumbs" class="pt-2 pb-2 text-sm border-noround-top bg-transparent" />
</template>

<script setup lang="ts">


const props = withDefaults(
    defineProps<{
        crumbs?: { label: string, to?: string }[],
    }>(),
    {

    }
);

</script>