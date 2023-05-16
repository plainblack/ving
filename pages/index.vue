<template>
    homepage goes here
    <Button @click="doit()">Doit</Button>
</template>

<script setup lang="ts">
async function doit() {
    console.log(await $fetch('/api/test?foo=bar'))
}
const notify = useNotifyStore();
onMounted(() => {
    const bus = new EventSource('/api/user/messagebus');
    bus.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type == 'toast') {
            notify.notify(message.data.severity, message.data.message);
        }
        else {
            console.log(message);
        }
    }
})
</script>