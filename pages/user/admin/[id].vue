<template>
    <AdminNav :crumbs="breadcrumbs" />
    <h1>Edit User {{ user.props?.username }}</h1>



    <FieldsetNav v-if="user.props">
        <FieldsetItem name="Account">
            <div class="mb-4">
                <FormInput name="username" v-model="user.props.username" required label="Username" @change="user.update" />
            </div>
            <div class="mb-4">
                <FormInput type="email" name="email" v-model="user.props.email" label="Email" required
                    @change="user.update" />
            </div>
            <div class="mb-4">
                <FormInput name="realName" v-model="user.props.realName" label="Real Name" @change="user.update" />
            </div>

            <div class="mb-4">
                <FormInput name="password" v-model="password" label="Password"
                    @change="user._partialUpdate({ password: password })" />
            </div>
        </FieldsetItem>

        <FieldsetItem name="Privileges">
            <div class="mb-4">
                <FormSelect @change="user.update" v-model="user.props.admin" :options="user.options?.admin" name="admin"
                    label="Admin" />
            </div>
        </FieldsetItem>

        <FieldsetItem name="Preferences">
            <div class="mb-4">
                <FormSelect @change="user.update" v-model="user.props.useAsDisplayName"
                    :options="user.options?.useAsDisplayName" name="useAsDisplayName" label="Use As Display Name" />
            </div>

            <div class="mb-4">
                <FormSelect @change="user.update" v-model="user.props.developer" :options="user.options?.developer"
                    label="Are you a software developer?" name="developer" />
            </div>

            <div class="mb-4">
                <span class="font-medium text-900 mb-2">Profile Picture</span><br>
                <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
            </div>
        </FieldsetItem>

        <FieldsetItem name="Statistics">
            <div class="mb-4">
                Created at {{ dt.formatDateTime(user.props.createdAt) }}
            </div>

            <div class="mb-4">
                Updated at {{ dt.formatDateTime(user.props.updatedAt) }}
            </div>
        </FieldsetItem>

        <FieldsetItem name="Actions">
            <Button @click="user.delete" severity="danger" class="mr-2 mb-2">Delete</Button>
            <Button @click="become" severity="warn" class="mr-2 mb-2">Become</Button>
        </FieldsetItem>

    </FieldsetNav>
</template>
  
<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'admin']
});
const route = useRoute();
const dt = useDateTime();
const notify = useNotifyStore();

const user = useVingRecord<'User'>({
    fetchApi: '/api/user/' + route.params.id,
    createApi: '/api/user',
    query: { includeMeta: true, includeOptions: true },
    onUpdate() {
        notify.success('Updated user.');
    },
    onDelete() {
        navigateTo('/user/admin');
    },
});

function become() {
    user.call('post', user.links?.self + '/become', undefined, {
        onSuccess() {
            const currentUser = useCurrentUserStore();
            currentUser.fetch();
            navigateTo('/');
        }
    })
}

const password = ref('');

const breadcrumbs = [
    { label: 'Admin', to: '/admin' },
    { label: 'Users', to: '/user/admin' },
    { label: 'Edit User' },
];

await user.fetch()
</script>