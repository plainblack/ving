<template>
    <div class="flex flex-col lg:flex-row">
        <div v-if="$slots.left" class="lg:pr-5 mb-1 lg:mb-0">        
            <div v-if="title" class="lg:mb-3 text-2xl text-color-secondary ml-1">{{section}}<template v-if="!section">&nbsp;</template></div>
            <slot name="left"></slot>
        </div>
        <div class="flex-auto">
            <div v-if="title" class="mb-3">
                <h1 class="font-semibold text-2xl m-0 p-0 ml-1"><slot name="title">{{ title }}</slot></h1>
            </div>
            <slot name="content"></slot>
        </div>
        <div v-if="$slots.right" class="lg:pl-5 mt-1 lg:mt-0">        
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        default : '',
    },
    section: {
        type: String,
        default : '',
    },
});
</script>