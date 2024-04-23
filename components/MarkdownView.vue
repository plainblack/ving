<template>
    <MdPreview :modelValue="text" :editorId="id" previewTheme="github"></MdPreview>
</template>

<script setup>
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const id = useId().replace(':','_').replace('$','_'); // nuxt's useId is stupid

const props = defineProps({
    text: {
        required: true,
    },
});
</script>

<style>
.md-editor-previewOnly > .md-editor-preview-wrapper { 
    padding: 0; 
}
</style>