<template></template>


<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
const currentUser = useCurrentUserStore();

await currentUser.logout();
await navigateTo('/');
</script>