<template>
    <Message v-if="swa.message" :closable="false" :severity="swa.severity">{{ swa.message }}</Message>
</template>

<script setup>
const swa = useSystemWideAlertStore();
onMounted(async () => {
    await swa.check();
})
</script>