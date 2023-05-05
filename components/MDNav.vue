<template>
    <ul class="list-none pl-3">
        <li :class="{
                'font-medium text-base mt-4': depth(link._path || '') < 1,
                'mt-2 text-sm': depth(link._path || '') == 1,
                'mt-2 text-xs': depth(link._path || '') > 1,
            }" v-for="link of filteredLinks()" :key="link._path">


            <NuxtLink :to="link._path">{{ link.title }}</NuxtLink>

            <MDNav v-if="link.children" :links="link.children" :parent="link._path" />
        </li>
    </ul>
</template>

<script setup lang="ts">
const props = defineProps({
    links: {
        type: Array,
        default: () => [],
    },
    parent: {
        type: String,
        default: '',
    }
})
function filteredLinks() {
    return props.links.filter((link) => link._path != props.parent);
}
function depth(text: string) {
    const parts = text.split(/\//);
    return parts.length - 3;
}
</script>