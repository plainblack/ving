<template>
    <Title>System Wide Alert</Title>
    <PanelFrame section="Admin" title="System Wide Alert">
        <template #left>
            <PanelNav :links="links" />
        </template>
        <template #content>
    <PanelZone title="Edit System Wide Alert" info="Add an announcement on every page in the site.">

        <FormInput type="textarea" name="message" v-model="swa.message" label="Message" class="mb-4" />

        <FormInput type="select" name="ttl" v-model="swa.ttl" :options="ttlOptions" label="Time To Live" class="mb-4" />

        <div class="mb-4">
            <FormLabel label="Severity" />
            <div class="flex">
                    <Message severity="success" :closable="false" class="mr-3">
                        <RadioButton v-model="swa.severity" inputId="success" name="severity" value="success" />
                        <label for="success" class="ml-2">Success</label>
                    </Message>
                    <Message severity="info" :closable="false" class="mr-3">
                        <RadioButton v-model="swa.severity" inputId="info" name="severity" value="info" />
                        <label for="info" class="ml-2">Info</label>
                    </Message>
                    <Message severity="warn" :closable="false" class="mr-3">
                        <RadioButton v-model="swa.severity" inputId="warn" name="severity" value="warn" />
                        <label for="warn" class="ml-2">Warn</label>
                    </Message>
                    <Message severity="error" :closable="false" class="mr-3">
                        <RadioButton v-model="swa.severity" inputId="error" name="severity" value="error" />
                        <label for="error" class="ml-2">Error</label>
                    </Message>
            </div>
        </div>

        <Button @mousedown="swa.post()" severity="success" class="mr-2">Save System Wide Alert</Button>
        <Button v-if="swa.message" @mousedown="swa.delete()" severity="danger" class="mr-2">Delete System Wide Alert</Button>

    </PanelZone>
        </template>
   </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth', 'admin'],
});
const ttlOptions = [
    { value: 1000 * 60 * 60, label: '1 hour' },
    { value: 1000 * 60 * 60 * 4, label: '4 hours' },
    { value: 1000 * 60 * 60 * 8, label: '8 hours' },
    { value: 1000 * 60 * 60 * 12, label: '12 hours' },
    { value: 1000 * 60 * 60 * 24, label: '1 day' },
    { value: 1000 * 60 * 60 * 24 * 2, label: '2 days' },
    { value: 1000 * 60 * 60 * 24 * 3, label: '3 days' },
    { value: 1000 * 60 * 60 * 24 * 7, label: '1 week' },
];

const swa = useSystemWideAlert();
const links = useAdminLinks();

</script>