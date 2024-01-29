<template>
    <div class="grid">
        <div class="xl:col-2 lg:col-3 md:col-4 sm:col-6">
            <nav>
                <ContentNavigation v-slot="{ navigation }">

                    <MDNav :links="navigation[0].children" />

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
<script setup>
</script>