<template>
    <AdminNav :crumbs="breadcrumbs" />

    <h1>Users</h1>

    <div class="surface-card p-4 border-1 surface-border border-round">

        <InputGroup>
            <InputGroupAddon>
                <i class="pi pi-search" />
            </InputGroupAddon>
            <InputText type="text" placeholder="Search Users" class="w-full" v-model="users.query.search"
                @keydown.enter="users.search()" />
            <Button label="Search" @click="users.search()" />
        </InputGroup>

        <client-only>
            <DataTable :value="users.records" stripedRows @sort="users.sortDataTable">
                <Column field="props.username" header="Username" sortable></Column>
                <Column field="props.realName" header="Real Name" sortable></Column>
                <Column field="props.email" header="Email Address" sortable>
                    <template #body="slotProps">
                        <a :href="`mailto:${slotProps.data.props.email}`">{{ slotProps.data.props.email }}</a>
                    </template>
                </Column>
                <Column field="props.createdAt" header="Created" sortable>
                    <template #body="slotProps">
                        {{ dt.formatDateTime(slotProps.data.props.createdAt) }}
                    </template>
                </Column>
                <Column header="Manage">
                    <template #body="slotProps">
                        <NuxtLink :to="`/user/admin/${slotProps.data.props.id}`" class="mr-2 no-underline">
                            <Button icon="pi pi-pencil" severity="success" />
                        </NuxtLink>
                        <Button icon="pi pi-trash" severity="danger" @click="slotProps.data.delete()" />
                    </template>
                </Column>
            </DataTable>
        </client-only>

        <Pager :kind="users" />



    </div>
    <div class="mt-5 surface-card p-5 border-1 surface-border border-round">
        <h2 class="mt-0">Create User</h2>

        <Form :send="() => users.create()">
            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">
                    <div class="mb-4">
                        <FormInput name="nausernameme" type="text" v-model="users.new.username" required
                            label="Username" />
                    </div>
                    <div class="mb-4">
                        <FormInput name="realName" type="text" v-model="users.new.realName" required
                            label="Real Name" />
                    </div>
                    <div class="mb-4">
                        <FormInput name="email" type="email" v-model="users.new.email" required label="Email" />
                    </div>

                    <div>
                        <Button type="submit" class="w-auto" severity="success">
                            <i class="pi pi-plus mr-1"></i> Create User
                        </Button>
                    </div>
                </div>

            </div>
        </Form>
    </div>
</template>

<script setup>

const notify = useNotifyStore();

definePageMeta({
    middleware: ['auth', 'admin']
});

const dt = useDateTime();
const users = useVingKind({
    listApi: `/api/${restVersion()}/user`,
    createApi: `/api/${restVersion()}/user`,
    query: { includeMeta: true, sortBy: 'username', sortOrder: 'asc' },
    newDefaults: { username: '', realName: '', email: '' },
});
await users.search();

onBeforeRouteLeave(() => users.dispose());

const breadcrumbs = [
    { label: 'Admin', to: '/admin' },
    { label: 'Users', to: '/user/admin' },
];

</script>