<template>
    hello there . try {{ foo }}
</template>

<script setup lang="ts">
import { Describe } from '~~/app/db';
let foo = 'boy';
//let user = ref<Describe<'User'>>({ props: {} });
//user = (await useFetch('/api/user/whoami')).data.value;

</script>