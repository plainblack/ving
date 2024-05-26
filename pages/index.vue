<template>
    <Title>{{ config.public?.site?.name }}</Title>
    homepage goes here
    <Button @mouseDown="doit()">Doit</Button>
</template>

<script setup>
const config = useRuntimeConfig();

async function doit() {
    console.log(await $fetch(`/api/${useRestVersion()}/test?foo=bar`))
}
</script>