<template>
    <PanelFrame>
        <template #left>
            <PanelNav :links="links" :buttons="buttons" />
        </template>
        <template #content v-if="currentUser.props">
                <div class="surface-card p-5 border-1 surface-border border-round">
                    <div class="text-900 font-semibold text-lg">API Keys</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">You can use API Keys to interact with the API.</p>

                    <div class="flex gap-5 flex-column-reverse md:flex-row">
                        <div class="flex-auto p-fluid">
                            <div class="mb-4">

                                <InputGroup>
                                    <InputGroupAddon>
                                        <Icon name="ion:search" />
                                    </InputGroupAddon>
                                    <InputText type="text" placeholder="Search API Keys" class="w-full"
                                        v-model="apikeys.query.search" @keydown.enter="apikeys.search()" />
                                    <Button label="Search" @click="apikeys.search()" />
                                </InputGroup>

                                <DataTable :value="apikeys.records" stripedRows
                                    @sort="(event) => apikeys.sortDataTable(event)">
                                    <Column field="props.createdAt" header="Created" sortable>
                                        <template #body="slotProps">
                                            {{ dt.formatDate(slotProps.data.props.createdAt) }}
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

                                    <div class="flex gap-5 flex-column-reverse md:flex-row" v-if="dialog.current">
                                        <div class="flex-auto p-fluid">
                                            <div class="mb-4">
                                                <FormInput name="name" type="text" v-model="dialog.current.props.name"
                                                    required label="Name" @change=" dialog.current.update()" />
                                            </div>
                                            <div class="mb-4">
                                                <FormInput name="url" type="text" v-model="dialog.current.props.url"
                                                    label="URL" @change=" dialog.current.update()" />
                                            </div>
                                            <div class="mb-4">
                                                <FormInput name="reason" type="textarea"
                                                    v-model="dialog.current.props.reason" label="Reason"
                                                    @change=" dialog.current.update()" />
                                            </div>

                                        </div>

                                    </div>

                                </Dialog>


                            </div>
                        </div>



                    </div>
                </div>
                <div class="mt-5 surface-card p-5 border-1 surface-border border-round">
                    <div class="text-900 font-semibold text-lg">Create API Key</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">Make a new API Key.</p>

                    <Form :send="() => apikeys.create()">
                        <div class="flex gap-5 flex-column-reverse md:flex-row">
                            <div class="flex-auto p-fluid">
                                <div class="mb-4">
                                    <FormInput name="name" type="text" v-model="apikeys.new.name" required
                                        label="Name" />
                                </div>
                                <div class="mb-4">
                                    <FormInput name="url" type="text" v-model="apikeys.new.url" label="URL" />
                                </div>
                                <div class="mb-4">
                                    <FormInput name="reason" type="textarea" v-model="apikeys.new.reason"
                                        label="Reason" />
                                </div>

                                <div>
                                    <Button type="submit" class="w-auto" severity="success">
                                        <Icon name="ph:plus" class="mr-1"/> Create API Key
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Form>
                </div>
            </template>
    </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});

const dt = useDateTime();
const currentUser = useCurrentUserStore();
const links = userSettingsLinks();
const buttons = userSettingsButtons();
const apikeys = useVingKind({
    listApi: currentUser.links?.apikeys.href,
    createApi: `/api/${restVersion()}/apikey`,
    query: { includeMeta: true, sortBy: 'name', sortOrder: 'asc' },
    newDefaults: { name: '', reason: '', url: 'http://', userId: currentUser.props?.id },
});
await apikeys.search();
onBeforeRouteLeave(() => apikeys.dispose());
const dialog = ref({ visible: false, current: undefined });
</script>