<template>
    <div id="vingthrobber" style="z-index: 10000; position: fixed; top: 0px; width: 100%;">
        <template v-if="throbber.counter > 0">
            <ProgressBar id="throbberprogressbar" mode="indeterminate" style="height: 5px"></ProgressBar>
        </template>
    </div>
</template>

<script setup>
const throbber = useThrobber();
</script>