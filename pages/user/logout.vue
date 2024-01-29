<template></template>


<script setup>
definePageMeta({
    middleware: 'auth'
});
const currentUser = useCurrentUserStore();

await currentUser.logout();
await navigateTo('/');
</script>