<template>
    <Fieldset :legend="name" :toggleable="true" :id="id" class="mb-3">
        <slot></slot>
    </Fieldset>
</template>

<script setup>

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
});

const id = 'id' + props.name.replace(/[^A-Za-z0-9]/g, '');

const register = inject('register', (name, id) => { });
const unregister = inject('unregister', (name) => { });

onMounted(() => {
    register(props.name, id);
})

onBeforeUnmount(() => {
    unregister(props.name);
})

</script>