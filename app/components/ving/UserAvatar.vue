<template>
    <span v-if="user" class="flex-inline items-center">
        <Avatar :image="user.links?.avatarImage?.href" alt="user avatar" shape="circle" />
        <span class="ml-2">
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