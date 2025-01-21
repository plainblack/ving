<template>
    <Title>API Key Settings</Title>
    <PanelFrame>
        <template #left>
            <PanelNav :links="links" :buttons="buttons" />
        </template>
        <template #content v-if="currentUser.props">
            <PanelZone title="API Keys" info="You can use API Keys to interact with the API.">
                <InputGroup>
                    <InputGroupAddon>
                        <Icon name="ion:search" />
                    </InputGroupAddon>
                    <InputText type="text" placeholder="Search API Keys" class="w-full"
                        v-model="apikeys.query.search" @keydown.enter="apikeys.search()" />
                    <Button label="Search" @mousedown="apikeys.search()" />
                </InputGroup>

                <DataTable :value="apikeys.records" stripedRows
                    @sort="(event) => apikeys.sortDataTable(event)">
                    <Column field="props.createdAt" header="Created" sortable>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.props.createdAt) }}
                        </template>
                    </Column>
                    <Column field="props.name" header="Name" sortable></Column>
                    <Column field="props.id" header="API Key">
                        <template #body="slotProps">
                            <CopyToClipboard :text="slotProps.data.props.id" />
                        </template>
                    </Column>
                    <Column field="props.privateKey" header="Private Key">
                        <template #body="slotProps">
                            <CopyToClipboard :text="slotProps.data.props.privateKey" />
                        </template>
                    </Column>
                    <Column header="Manage">
                        <template #body="slotProps">
                            <ManageButton severity="success" :items="[
                                { icon:'ph:pencil', label:'Edit', action:() => {dialog.current = slotProps.data; dialog.visible = true}},
                                { icon:'ph:trash', label:'Delete', action:slotProps.data.delete}
                                ]" /> 
                        </template>
                    </Column>
                </DataTable>

                <Pager :kind="apikeys" />

                <Dialog v-model:visible="dialog.visible" maximizable modal header="Header"
                    :style="{ width: '75vw' }">

                    <FormInput name="name" type="text" v-model="dialog.current.props.name" id="modal:name"
                        required label="Name" @change="dialog.current.save('name')" class="mb-4" />

                    <FormInput name="url" type="text" v-model="dialog.current.props.url" id="modal:url"
                    label="URL" @change="dialog.current.save('url')" class="mb-4" />

                    <FormInput name="reason" type="textarea" id="modal:reason"
                    v-model="dialog.current.props.reason" label="Reason"
                    @change="dialog.current.save('reason');" class="mb-4" />
    
                </Dialog>
            </PanelZone>
            
            <PanelZone title="Create API Key" info="Make a new API Key.">
                <VForm :send="() => apikeys.create()">
                  
                    <FormInput name="name" type="text" v-model="apikeys.new.name" required
                        label="Name" class="mb-4" />

                    <FormInput name="url" type="text" v-model="apikeys.new.url" label="URL" class="mb-4" />

                    <FormInput name="reason" type="textarea" v-model="apikeys.new.reason"
                    label="Reason" class="mb-4" />

                    <Button type="submit" class="w-auto" severity="success">
                        <Icon name="ph:plus" class="mr-1"/> Create API Key
                    </Button>
                      
                </VForm>
            </PanelZone>
               
        </template>
    </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});
const currentUser = useCurrentUser();
const links = useUserSettingsLinks();
const buttons = useUserSettingsButtons();
const apikeys = useVingKind({
    listApi: currentUser.links?.apikeys.href,
    createApi: `/api/${useRestVersion()}/apikeys`,
    query: { includeMeta: true, sortBy: 'name', sortOrder: 'asc' },
    newDefaults: { name: 'My New API Key', reason: '', url: 'http://', userId: currentUser.props?.id },
});
await apikeys.search();
onBeforeRouteLeave(() => apikeys.dispose());
const dialog = ref({ visible: false, current: undefined });
</script>