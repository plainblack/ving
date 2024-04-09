<template>
    <Button icon="pi pi-copy" class="mr-2" alt="copy to clipboard" title="Copy to Clipboard"
        @click="copyToClipboard(text)" />
</template>

<script setup>
const notify = useNotifyStore();

const props = defineProps({
    text: String,
});
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    notify.info('Copied to Clipboard');
}
</script>