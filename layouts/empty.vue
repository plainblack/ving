<template>
    <client-only>
        <SystemWideAlert />
    </client-only>
    <slot />
    <client-only>
        <Notify />
        <Throbber />
    </client-only>
</template>

<script setup>
onMounted(async () => {
    // subscribe to message bus
    useMessageBus();
})
</script>