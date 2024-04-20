<template>
    <client-only>
        <SystemWideAlert />
    </client-only>
    <div class="px-0 py-4 md:px-4">
        <div style="min-height: 20rem">
            <slot />
        </div>
    </div>
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