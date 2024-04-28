<template>
        <PanelFrame>
            <template #left>
                <PanelNav :links="links" :buttons="buttons" />
            </template>
            <template #content v-if="currentUser.props">
                <PanelZone title="Preferences" info="These settings will change your experience on the site.">
                    <div class="mb-4">
                        <FormInput type="select" @change="currentUser.save('developer')" v-model="currentUser.props.developer"
                            :options="currentUser.options?.developer" label="Are you a software developer?"
                            name="developer" />
                    </div>
                </PanelZone>
            </template>
        </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});
const currentUser = useCurrentUserStore();
const links = userSettingsLinks();
const buttons = userSettingsButtons();
</script>