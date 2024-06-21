<template>
    <Title>{{ error?.statusCode || 500 }} {{ error?.statusMessage || "" }}</Title>
    <div class="surface-section px-4 py-8 md:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row justify-content-center items-center gap-7">
            <div class="text-center lg:text-right">
                <div class="mt-6 mb-3 font-bold text-7xl text-900">{{ error?.statusCode || 500 }}</div>
                <div class="mt-6 mb-3 font-bold text-6xl text-900">{{ error?.statusMessage || "" }}</div>
                <p class="text-700 text-3xl mt-0 mb-6">{{ error?.message || "" }}</p>
                <p class="text-700 text-3xl mt-0 mb-6">{{ error?.description || "" }}</p>
                <NuxtLink to="/" v-slot="{ navigate }" custom>
                    <Button @mousedown="navigate" type="button" label="Go back to home page"></Button>
                </NuxtLink>
            </div>
            <div>
                <img :src="config.public.site.logoUrl" :alt="config.public.site.name" class="w-full md:w-28rem" />
            </div>
        </div>
    </div>
</template>

<script setup>
const error = useError();
const config = useRuntimeConfig();
</script>