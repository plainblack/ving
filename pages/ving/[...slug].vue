<template>
    <div class="grid">
        <div class="xl:col-2 lg:col-3 md:col-4 sm:col-6">
            <nav>
                <ContentNavigation v-slot="{ navigation }">
                    <ul class="list-none">
                        <li :class="{
                            'font-medium text-base mt-4 ml-0': depth(link._file || '') < 1,
                            'mt-2 text-sm ml-2': depth(link._file || '') == 1,
                            'mt-2 text-xs ml-4': depth(link._file || '') > 1,
                        }" v-for="link of ving" :key="link._path">

                            <NuxtLink :to="link._path">{{ link.title }}</NuxtLink>
                        </li>
                    </ul>

                </ContentNavigation>
            </nav>
        </div>
        <div class="col">
            <main>
                <ContentDoc />
            </main>
        </div>
    </div>
</template>
<script lang="ts" setup>
const { data: ving } = await useAsyncData('ving', () => queryContent('/ving').find())
function depth(text: string) {
    const parts = text.split(/\//);
    return parts.length - 2;
}
</script>