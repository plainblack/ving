<template>
    <Toast position="bottom-left" group="bl">
        <template #message="slotProps">
            <div class="p-toast-message-text">
                <span class="p-toast-summary">{{ slotProps.message.summary }}</span>
                <div class="p-toast-detail" v-html="slotProps.message.detail" />
            </div>
        </template>
    </Toast>
    <Toast position="center" group="c">
        <template #message="slotProps">
            <div class="p-toast-message-text">
                <span class="p-toast-summary">{{ slotProps.message.summary }}</span>
                <div class="p-toast-detail" v-html="slotProps.message.detail" />
            </div>
        </template>
    </Toast>
</template>

<script setup>
import { useToast } from "primevue/usetoast";

const notify = useNotify();
const toast = useToast();

notify.$subscribe((mutation, state) => {
    if (state.successMessage != '') {
        toast.add({ severity: 'success', detail: state.successMessage, group: 'bl', life: 8000 });
        notify.success('');
    }
    if (state.errorMessage != '') {
        toast.add({ severity: 'error', detail: state.errorMessage, group: 'c' });
        notify.error('');
    }
    if (state.infoMessage != '') {
        toast.add({ severity: 'info', detail: state.infoMessage, group: 'bl', life: 8000 });
        notify.info('');
    }
    if (state.warnMessage != '') {
        toast.add({ severity: 'warn', detail: state.warnMessage, group: 'bl', life: 8000 });
        notify.warn('');
    }
});
</script>