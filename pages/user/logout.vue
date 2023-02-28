<template></template>


<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
const currentUserStore = useCurrentUserStore();

await currentUserStore.logout();
navigateTo('/');
</script>