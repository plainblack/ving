<template>
    <div id="vingthrobber" class="fixed z-[10000] top-0 w-full">
        <template v-if="throbber.counter > 0">
            <ProgressBar id="throbberprogressbar" mode="indeterminate" class="h-0.5"></ProgressBar>
        </template>
    </div>
</template>

<script setup>
const throbber = useThrobber();
</script>