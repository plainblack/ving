<template>
    <form @invalid-field="invalidField" @submit.prevent="check">
        <slot />
        <Toast />
    </form>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
const toast = useToast();

function invalidField(e: Event) {
    console.log(e);
    if (e.target) {
        console.log(e.target)
    }
}

const tracker: Record<string, { value: boolean, message?: string }> = {};

let invalid = false;

provide('invalidForm', function (newValue: [string, boolean, string?]) {
    tracker[newValue[0]] = { value: newValue[1], message: newValue[2] };
    invalid = false;
    for (const key in tracker) {
        if (tracker[key].value)
            invalid = true;
    }
});

const props = withDefaults(
    defineProps<{
        send: (e: Event) => void,
    }>(),
    {
        send() { },
    }
);

function check(e: Event) {
    if (invalid) {
        const problems = [];
        for (const key in tracker) {
            if (tracker[key].value)
                problems.push(tracker[key].message);
        }
        console.log('Cannot submit because: ' + problems.join(' '));
        toast.add({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    }
    else {
        props.send(e);
    }
}

</script>