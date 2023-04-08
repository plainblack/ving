<template>
    <div class="surface-ground">
        <div class="surface-card p-5 shadow-2 border-round">
            <h1 class="mt-0">Users</h1>

            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">
                    <div class="mb-4">

                        <DataTable :value="users.records" stripedRows>
                            <Column field="props.username" header="Username"></Column>
                            <Column field="props.realName" header="Real Name"></Column>
                            <Column field="props.email" header="Email Address">
                                <template #body="slotProps">
                                    <a :href="`mailto:${slotProps.data.props.email}`">{{ slotProps.data.props.email }}</a>
                                </template>
                            </Column>
                            <Column field="props.createdAt" header="Created">
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



                    </div>
                </div>



            </div>
        </div>
        <div class="mt-5 surface-card p-5 shadow-2 border-round">
            <h2 class="mt-0">Create User</h2>

            <Form :send="() => users.create()">
                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <FormInput name="name" type="text" v-model="users.new.username" required label="Username" />
                        </div>
                        <div class="mb-4">
                            <FormInput name="realName" type="text" v-model="users.new.realName" required
                                label="Real Name" />
                        </div>
                        <div class="mb-4">
                            <FormInput name="email" type="text" v-model="users.new.email" required label="Email" />
                        </div>

                        <div>
                            <Button type="submit" class="w-auto">
                                Create User
                            </Button>
                        </div>
                    </div>

                </div>
            </Form>
        </div>

    </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const notify = useNotifyStore();

definePageMeta({
    middleware: ['auth', 'admin']
});

const dt = useDateTime();
const users = useVingKind<'User'>({
    listApi: '/api/user',
    createApi: '/api/user',
    query: { includeMeta: true },
    newDefaults: { username: '', realName: '', email: '' },
});
await users.all();


</script>