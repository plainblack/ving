<template>
    <span v-if="user" class="flex-inline align-items-center">
        <Avatar :image="user.meta?.avatarUrl" alt="user avatar" shape="circle" class="vertical-align-middle" />
        <span class="ml-2 vertical-align-middle">
            {{ user.meta?.displayName }}
        </span>
    </span>
    <Message v-else severity="error">You may need to <i>includeRelated:['user']</i> to view this.</Message>
</template>

<script setup>
const props = defineProps({
    user: Object,
});
</script>