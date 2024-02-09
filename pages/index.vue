<template>
    homepage goes here
    <Button @click="doit()">Doit</Button>

    <client-only>
        <Dropzone></Dropzone>
    </client-only>
</template>

<script setup>


async function doit() {
    console.log(await $fetch('/api/test?foo=bar'))
}
</script>