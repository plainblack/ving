<template>
    <div class="p-fluid flex flex-column lg:flex-row">
        <div v-if="$slots.left" class="lg:pr-5">        
            <slot name="left"></slot>
        </div>
        <div class="flex-auto">
            <slot name="content"></slot>
        </div>
        <div v-if="$slots.right" class="lg:pl-5 mt-1 lg:mt-0">        
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script setup>

</script>