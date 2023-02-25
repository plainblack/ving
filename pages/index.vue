<template>
    hello there {{ user && user.props && user.props.username }}. try {{ foo }}
</template>

<script setup lang="ts">
import { Describe } from '~/utils/db';
let foo = 'boy';
let user = ref<Describe<'User'>>({ props: {} });
user = (await useFetch('/api/user/whoami')).data.value;

</script>