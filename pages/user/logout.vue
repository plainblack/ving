<template></template>


<script setup lang="ts">
const currentUserStore = useCurrentUserStore();

await currentUserStore.logout();
navigateTo('/');
</script>