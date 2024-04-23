<template>
    <Button icon="pi pi-copy" :class="buttonClass" alt="copy to clipboard" title="Copy to Clipboard"
        @click="copyToClipboard(text)" />
</template>

<script setup>
const notify = useNotifyStore();

const props = defineProps({
    text: String,
    size : {
        default: ''
    }
});

const buttonClass = computed(() => {
    let out = [''];
    if (props.size == 'sm') {
        return 'p-button-sm'
    }
    if (props.size == 'lg') {
        return 'p-button-lg'
    }
    if (props.size == 'xs') {
        return 'p-button-sm p-1'
    }
    return out.join(' ');
})

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    notify.info('Copied to Clipboard');
}
</script>