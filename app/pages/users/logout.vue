<template>
    <Title>Logged out of {{ config.public?.site?.name }}</Title>
    <p>You are now logged out.</p>

    <NuxtLink to="/" v-slot="{ navigate }" custom>
        <Button @mousedown="navigate" type="button" label="Return to home page" class="p-button-outlined mt-5"></Button>
    </NuxtLink>
</template>


<script setup>
import { sleep } from '#ving/utils/sleep.mjs';
definePageMeta({
    middleware: 'auth'
});
const config = useRuntimeConfig();
const currentUser = useCurrentUser();
await currentUser.logout();
await sleep(1000);
await navigateTo('/');

</script>