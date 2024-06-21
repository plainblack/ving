<template>
    <NuxtLink v-if="user" :to="`/user/${user.props.id}/profile`">
        <UserAvatar :user="user" />
    </NuxtLink>
    <Message v-else severity="error">You may need to <i>includeRelated:['user']</i> to view this.</Message>
</template>

<script setup>
const props = defineProps({
    user: Object,
});
</script>