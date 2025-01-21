<template>
    <Title>Users</Title>
    <PanelFrame section="Admin" title="Users">
        <template #left>
            <PanelNav :links="links" />
        </template>
        <template #content>
            <PanelZone title="Existing Users">

                <InputGroup>
                    <InputGroupAddon>
                        <Icon name="ion:search" />
                    </InputGroupAddon>
                    <InputText type="text" placeholder="Search Users" class="w-full" v-model="users.query.search"
                        @keydown.enter="users.search()" />
                    <Button label="Search" @mousedown="users.search()" />
                </InputGroup>

                <DataTable :value="users.records" stripedRows @sort="users.sortDataTable">
                    <Column field="props.username" header="Username" sortable>
                        <template #body="slotProps">
                            <NuxtLink :to="slotProps.data.links.edit.href">
                                {{ slotProps.data.props.username }}
                            </NuxtLink>
                        </template>
                    </Column>
                    
                    <Column field="props.realName" header="Real Name" sortable></Column>
                    <Column field="props.email" header="Email Address" sortable>
                        <template #body="slotProps">
                            <a :href="`mailto:${slotProps.data.props.email}`">{{ slotProps.data.props.email }}</a>
                        </template>
                    </Column>
                    <Column field="props.createdAt" header="Created" sortable>
                        <template #body="slotProps">
                            {{ formatDateTime(slotProps.data.props.createdAt) }}
                        </template>
                    </Column>
                    <Column header="Manage">
                        <template #body="slotProps">
                            <ManageButton severity="success" :items="[
                                { icon:'ph:pencil', label:'Edit', to:slotProps.data.links.edit.href},
                                { icon:'ph:trash', label:'Delete', action:slotProps.data.delete}
                                ]" /> 
                        </template>
                    </Column>
                </DataTable>

                <Pager :kind="users" />



            </PanelZone>
        <PanelZone title="Create User">

                <VForm :send="() => users.create()">
                
                    <FormInput name="nausernameme" type="text" v-model="users.new.username" required
                        label="Username" class="mb-4" />

                    <FormInput name="realName" type="text" v-model="users.new.realName" required
                    label="Real Name" class="mb-4" />

                    <FormInput name="email" type="email" v-model="users.new.email" required label="Email" class="mb-4" />

                    <Button type="submit" class="w-auto" severity="success">
                        <Icon name="ph:plus" class="mr-1"/> Create User
                    </Button>
                    
                </VForm>
            </PanelZone>
        </template>
    </PanelFrame>
</template>

<script setup>
const notify = useNotify();
definePageMeta({
    middleware: ['auth', 'admin'],
});

const users = useVingKind({
    listApi: `/api/${useRestVersion()}/users`,
    createApi: `/api/${useRestVersion()}/users`,
    query: { includeMeta: true, sortBy: 'username', sortOrder: 'asc' },
    newDefaults: { username: '', realName: '', email: '' },
    onCreate(props) {
        navigateTo(props.links.edit.href)
    },
});
await users.search();

onBeforeRouteLeave(() => users.dispose());
const links = useAdminLinks();
</script>