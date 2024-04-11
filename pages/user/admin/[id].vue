<template>
    <AdminNav :crumbs="breadcrumbs" />
    <h1>Edit User {{ user.props?.username }}</h1>

    <client-only>
        <FieldsetNav v-if="user.props?.id">
            <FieldsetItem name="Account">
                <div class="mb-4">
                    <FormInput name="username" v-model="user.props.username" required label="Username"
                        @change="user.update()" />
                </div>
                <div class="mb-4">
                    <FormInput type="email" name="email" v-model="user.props.email" label="Email" required
                        @change="user.update()" />
                </div>
                <div class="mb-4">
                    <FormInput name="realName" v-model="user.props.realName" label="Real Name"
                        @change="user.update()" />
                </div>

                <div class="mb-4">
                    <FormInput name="password" v-model="password" label="Password"
                        @change="user.partialUpdate({ password: password })" />
                </div>
            </FieldsetItem>

            <FieldsetItem name="Privileges">
                <div class="mb-4">
                    <FormSelect @change="user.update()" v-model="user.props.admin" :options="user.options?.admin"
                        name="admin" label="Admin" />
                </div>
            </FieldsetItem>

            <FieldsetItem name="Preferences">
                <div class="mb-4">
                    <FormSelect @change="user.update()" v-model="user.props.useAsDisplayName"
                        :options="user.options?.useAsDisplayName" name="useAsDisplayName" label="Use As Display Name" />
                </div>

                <div class="mb-4">
                    <FormSelect @change="user.update()" v-model="user.props.developer"
                        :options="user.options?.developer" label="Are you a software developer?" name="developer" />
                </div>

                <div class="mb-4">
                    <span class="font-medium text-900 mb-2">Profile Picture</span><br>
                    <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                </div>
            </FieldsetItem>

            <FieldsetItem name="Statistics">
                <div class="mb-4"><b>Id</b>: {{ user.props?.id }}
                    <CopyToClipboard :text="user.props.id" />
                </div>

                <div class="mb-4">
                    Created at {{ dt.formatDateTime(user.props.createdAt) }}
                </div>

                <div class="mb-4">
                    Updated at {{ dt.formatDateTime(user.props.updatedAt) }}
                </div>
            </FieldsetItem>

            <FieldsetItem name="Actions">
                <Button @click="user.delete()" severity="danger" class="mr-2 mb-2" title="Delete" alt="Delete User"><i
                        class="pi pi-trash mr-1"></i> Delete</Button>
                <Button @click="become" severity="warn" class="mr-2 mb-2" title="Become" alt="Become User"><i
                        class="pi pi-arrow-right-arrow-left mr-1"></i> Become</Button>
            </FieldsetItem>

        </FieldsetNav>
    </client-only>
</template>

<script setup>
definePageMeta({
    middleware: ['auth', 'admin']
});
const route = useRoute();
const dt = useDateTime();
const notify = useNotifyStore();

const id = route.params.id.toString();
const user = useVingRecord({
    id,
    fetchApi: `/api/${restVersion()}/user/${id}`,
    createApi: `/api/${restVersion()}/user`,
    query: { includeMeta: true, includeOptions: true },
    onUpdate() {
        notify.success('Updated user.');
    },
    async onDelete() {
        await navigateTo('/user/admin');
    },
});
await user.fetch()

onBeforeRouteLeave(() => user.dispose());

async function become() {
    await user.call('post', user.links?.self.href + '/become', undefined, {
        async onSuccess() {
            const currentUser = useCurrentUserStore();
            currentUser.fetch();
            await navigateTo('/');
        }
    })
}

const password = ref('');

const breadcrumbs = [
    { label: 'Admin', to: '/admin' },
    { label: 'Users', to: '/user/admin' },
    { label: 'Edit User' },
];

</script>