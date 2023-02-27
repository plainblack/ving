<template>
    <div class="grid min-h-full grid-cols-1 grid-rows-[1fr,auto,1fr] bg-white lg:grid-cols-[max(50%,36rem),1fr]">
        <header class="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
            <a href="/">
                <span class="sr-only">{{ config.public.companyName }}</span>
                <img class="h-10 w-auto sm:h-12" :src="config.public.logoUrl" :alt="config.public.companyName" />
            </a>
        </header>
        <main class="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
            <div class="max-w-lg">
                <p class="text-base font-semibold leading-8 text-indigo-600">{{ error.statusCode }}</p>
                <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{{ error.statusMessage }}</h1>
                <p class="mt-6 text-base leading-7 text-gray-600">{{ error.message }}</p>
                <p class="mt-6 text-base leading-7 text-gray-600">{{ error.description }}</p>
                <div class="mt-10">
                    <a href="#" class="text-sm font-semibold leading-7 text-indigo-600"><span
                            aria-hidden="true">&larr;</span> Back to home</a>
                </div>
            </div>
        </main>
        <footer class="self-end lg:col-span-2 lg:col-start-1 lg:row-start-3">
            <div class="border-t border-gray-100 bg-gray-50 py-10">
                <nav
                    class="mx-auto flex w-full max-w-7xl items-center gap-x-4 px-6 text-sm leading-7 text-gray-600 lg:px-8">
                    <a href="#">Contact support</a>
                    <svg viewBox="0 0 2 2" aria-hidden="true" class="h-0.5 w-0.5 fill-gray-300">
                        <circle cx="1" cy="1" r="1" />
                    </svg>
                    <a href="#">Status</a>
                    <svg viewBox="0 0 2 2" aria-hidden="true" class="h-0.5 w-0.5 fill-gray-300">
                        <circle cx="1" cy="1" r="1" />
                    </svg>
                    <a href="#">Twitter</a>
                </nav>
            </div>
        </footer>
        <div class="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
            <img src="https://images.unsplash.com/photo-1470847355775-e0e3c35a9a2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
                alt="" class="absolute inset-0 h-full w-full object-cover" />
        </div>
    </div>
</template>

<script setup>
const error = useError();
const config = useRuntimeConfig();

</script>