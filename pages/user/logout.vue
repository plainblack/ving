<template>
    <p>You are now logged out.</p>

    <NuxtLink to="/" v-slot="{ navigate }" custom>
        <Button @click="navigate" type="button" label="Return to home page" class="p-button-outlined mt-5"></Button>
    </NuxtLink>
</template>


<script setup>
definePageMeta({
    middleware: 'auth'
});
const currentUser = useCurrentUserStore();
await currentUser.logout();

</script>