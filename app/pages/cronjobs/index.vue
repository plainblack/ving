<template>
    <Title>Cron Jobs</Title>
    <PanelFrame title="Cron Jobs">
        <template #left>
            <PanelNav :links="links" />
        </template>
        <template #content>
            <PanelZone title="Existing Cron Jobs">
                <DataTable :value="cronjobs.records" stripedRows @sort="(e) => cronjobs.sortDataTable(e)">
                    
                    <Column field="props.schedule" header="Schedule" sortable></Column>
                    <Column field="props.handler" header="Handler" sortable></Column>
                    <Column field="props.params" header="Params" sortable></Column>
                    <Column field="props.enabled" header="Enabled" sortable>
                        <template #body="slotProps">
                            {{ enum2label(slotProps.data.props.enabled, cronjobs.propsOptions.enabled) }}
                        </template>
                    </Column>
                    <Column header="Manage">
                        <template #body="slotProps">
                            <ManageButton severity="primary" :items="[
                                { icon:'ph:pencil', label:'Edit', to:slotProps.data.links.edit.href },
                                { icon:'ph:trash', label:'Delete', action:slotProps.data.delete}
                                ]" /> 
                        </template>
                    </Column>
                </DataTable>
                <Pager :kind="cronjobs" />
            </PanelZone>
            <PanelZone title="Create Cron Job">
                <VForm :send="() => cronjobs.create()">
                    
                    <FormInput name="schedule" type="text" v-model="cronjobs.new.schedule" required label="Schedule" class="mb-4" />
                    <FormInput name="handler" type="select" v-model="cronjobs.new.handler" :options="cronjobs.propsOptions?.handler" required label="Handler" class="mb-4" />
                    <div>
                        <Button type="submit" class="w-auto" severity="success">
                            <Icon name="ph:plus" class="mr-1"/> Create Cron Job
                        </Button>
                    </div>
                </VForm>
            </PanelZone>
        </template>
    </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth', 'admin']
});
const cronjobs = useVingKind({
    listApi: `/api/${useRestVersion()}/cronjobs`,
    createApi: `/api/${useRestVersion()}/cronjobs`,
    query: { includeMeta: true, sortBy: 'schedule', sortOrder: 'asc'  },
    newDefaults: { schedule: '* * * * *', handler: 'Test', enabled: true },
    onCreate(props) {
        navigateTo(props.links.edit.href)
    },
});
await Promise.all([
    cronjobs.search(),
    cronjobs.fetchPropsOptions(),
]);
onBeforeRouteLeave(() => cronjobs.dispose());
const links = useAdminLinks();

</script>