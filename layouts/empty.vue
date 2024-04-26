<template>
    <SystemWideAlert />
    <slot />
    <Notify />
    <Throbber />
</template>

<script setup>
onMounted(async () => {
    // subscribe to message bus
    useMessageBus();
})
</script>