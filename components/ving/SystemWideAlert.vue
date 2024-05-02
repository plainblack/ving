<template>
    <Message v-if="swa.message" :closable="false" :severity="swa.severity" class="m-0 border-1 border-noround">{{ swa.message }}</Message>
</template>

<script setup>
const swa = useSystemWideAlert();
onMounted(async () => {
    await swa.check();
})
</script>