<template>
    homepage goes here
    <Button @click="doit()">Doit</Button>
</template>

<script setup>
async function doit() {
    console.log(await $fetch(`/api/${useRestVersion()}/test?foo=bar`))
}
</script>