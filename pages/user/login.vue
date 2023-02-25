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
    const result = await useFetch('/api/session', {
        method: 'POST',
        body: {
            login,
            password
        }
    })
    console.log(result)
}
</script>


