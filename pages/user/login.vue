<template>
    <input type="text" v-model="login">
    <input type="text" v-model="password">
    {{ login }} {{ password }}
    <button @click="tryLogin">log in</button>

    <p> {{ user.props && user.props.displayName }}</p>
</template>

<script setup lang="ts">
import { Describe } from '~/utils/db';
let login = ref('');
let password = ref('');
let user = ref<Describe<'User'>>({ props: {} });

async function tryLogin() {
    const session = await useFetch('/api/session?includeRelated=user', {
        method: 'POST',
        body: {
            login,
            password
        }
    });
    if (session.data.value && session.data.value.related && session.data.value.related.user) {
        user.value = session.data.value.related?.user;
    }
}
</script>


