<template>
    <MdEditor v-model="val" @onChange="changed" :placeholder="placeholder" :showCodeRowNumber="true" :editorId="id" language="en-US" :toolbars="toolbars" noUploadImg />
</template>

<script setup>
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { debounce } from 'perfect-debounce';

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    placeholder: String,
    modelValue: {
        required: true,
    },
});

const emit = defineEmits(['update:modelValue','change']);

const changed = debounce( () => {
    emit('change')
}, 500, { leading: false, trailing: false });

const val = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emit('update:modelValue', val);
    }
});




const toolbars = [
  'bold',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  '=',
  'pageFullscreen',
  'preview',
];
</script>