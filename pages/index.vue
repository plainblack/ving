<template>
    homepage goes here
    <Button @click="doit()">Doit</Button>
    <div v-if="user.meta?.displayName">{{ user.meta.displayName }}</div>
    <div v-else>Nope</div>
</template>

<script setup lang="ts">
async function doit() {
    console.log(await $fetch('/api/test?foo=bar'))
}
const user = useVingRecord<'User'>({
    id: 'ecc5875f-cf3a-46fd-9393-93a2fdd3d2b9',
    fetchApi: '/api/user/ecc5875f-cf3a-46fd-9393-93a2fdd3d2b9',
    createApi: '/api/user',
    query: { includeMeta: true, includeOptions: true },
});
</script>