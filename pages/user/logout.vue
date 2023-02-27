<template></template>


<script setup lang="ts">
import { useCurrentUserStore } from '~/stores/currentUserStore';

const currentUserStore = useCurrentUserStore();

await currentUserStore.logout();
navigateTo('/');

</script>