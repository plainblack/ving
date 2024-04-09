<template>
    <NuxtLink v-if="user" :to="`/user/${user.props.id}/profile`" v-ripple class="flex align-items-center">
        <Avatar :image="user.meta?.avatarUrl" alt="user avatar" shape="circle" />
        <span class="ml-2">
            {{ user.meta?.displayName }}
        </span>
    </NuxtLink>
    <Message v-else severity="error">You may need to <i>includeRelated:['user']</i> to view this.</Message>
</template>

<script setup>
const props = defineProps({
    user: Object,
});
</script>