<template>
    <div id="wingajaxprogress" style="z-index: 10000; position: fixed; top: 0px; width: 100%;">
        <template v-if="throbber.counter > 0">
            <ProgressBar mode="indeterminate" style="height: 5px"></ProgressBar>
        </template>
    </div>
</template>

<script setup>
const throbber = useThrobberStore();
onMounted(() => throbber.counter = 0);
</script>