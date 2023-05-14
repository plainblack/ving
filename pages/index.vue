<template>
    homepage goes here
    <Button @click="doit()">Doit</Button>
</template>

<script setup lang="ts">
async function doit() {
    console.log(await $fetch('/api/test?foo=bar'))
}
</script>