<template>
    <input type="text" v-model="login">
    <input type="text" v-model="password">
    {{ login }} {{ password }}
    <button @click="tryLogin">log in</button>
</template>

<script setup lang="ts">
let login = ref('');
let password = ref('');

async function tryLogin() {
    const session = await useFetch('/api/session?includeRelated=user', {
        method: 'POST',
        body: {
            login,
            password
        }
    });
    if (session.data.value) {
        const user = session.data.value.related?.user;
        console.log(user);
    }
}
</script>


