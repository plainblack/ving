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

<script setup lang="ts">
import { useToast } from "primevue/usetoast";

const notify = useNotifyStore();
const toast = useToast();

notify.$subscribe((mutation, state) => {
    // @ts-expect-error - it thinks there's no key but there is
    const key = mutation.events.key;
    switch (key) {
        case 'successMessage': {
            if (state.successMessage == '')
                break;
            toast.add({ severity: 'success', detail: state.successMessage, group: 'bl', life: 8000 });
            notify.success('');
            break;
        }
        case 'errorMessage': {
            if (state.errorMessage == '')
                break;
            toast.add({ severity: 'error', detail: state.errorMessage, group: 'c' });
            notify.error('');
            break;
        }
        case 'infoMessage': {
            if (state.infoMessage == '')
                break;
            toast.add({ severity: 'info', detail: state.infoMessage, group: 'bl', life: 8000 });
            notify.info('');
            break;
        }
        case 'warnMessage': {
            if (state.warnMessage == '')
                break;
            toast.add({ severity: 'warn', detail: state.warnMessage, group: 'bl', life: 8000 });
            notify.warn('');
            break;
        }
    }
});
</script>