<template>
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
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped></style>