<template>
    <Fieldset :legend="name" :toggleable="true" :id="id" class="mb-3">
        <slot></slot>
    </Fieldset>
</template>

<script setup lang="ts">

const props = withDefaults(
    defineProps<{
        name: string,
    }>(),
    {

    }
);

const id = 'id' + props.name.replace(/[^A-Za-z0-9]/g, '');

const register = inject('register', (name: string, id: string) => { });
const unregister = inject('unregister', (name: string) => { });

onMounted(() => {
    register(props.name, id);
})

onBeforeUnmount(() => {
    unregister(props.name);
})

</script>