<template>
    <form @submit.prevent="check">
        <slot />
        <Toast />
    </form>
</template>

<script setup>

const tracker = {};

let invalid = false;

provide('invalidForm', function (newValue) {
    tracker[newValue[0]] = { value: newValue[1], message: newValue[2] };
    invalid = false;
    for (const key in tracker) {
        if (tracker[key].value)
            invalid = true;
    }
});

const props = defineProps({
    send: {
        type: Function,
        default: () => { async () => { } },
    },
});


const notify = useNotify();

async function check(e) {
    if (invalid) {
        const problems = [];
        for (const key in tracker) {
            if (tracker[key].value)
                problems.push(tracker[key].message);
        }
        notify.error('Cannot submit form because: <ul><li>' + problems.join('</li><li>') + '</li></ul>');
    }
    else {
        await props.send();
    }
}

</script>