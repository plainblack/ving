<template>
    <NConfigProvider>
        <NGlobalStyle />
        <div>
            <header>
                <NuxtLink to="/">
                    <h1>Ving</h1>
                </NuxtLink>
                <NuxtLink to="/user/login">
                    <i class="fa-regular fa-circle-user"></i>
                </NuxtLink>
            </header>
            <div>
                <NButton>Default</NButton>
                <slot />
            </div>
        </div>
    </NConfigProvider>
</template>

<script setup lang="ts">

</script>

<style scoped></style>