<template>
    <Title>Edit User {{user.props?.username}}</Title>
    <PanelFrame section="Admin" :title="`Edit User ${user.props?.username}`">
        <template #left>
            <PanelNav :links="links" />
        </template>
        <template #content>
            <FieldsetNav v-if="user.props?.id">
                <FieldsetItem name="Account">
                    <FormInput name="username" v-model="user.props.username" required label="Username"
                        @change="user.save('username')" class="mb-4" />

                    <FormInput type="email" name="email" v-model="user.props.email" label="Email" required
                    @change="user.save('email')" class="mb-4" />

                    <FormInput name="realName" v-model="user.props.realName" label="Real Name"
                    @change="user.save('realName')" class="mb-4" />

                    <FormInput name="password" v-model="password" label="Password"
                        @change="user.save('password')" class="mb-4" />
                </FieldsetItem>

                <FieldsetItem name="Privileges">
                        <FormInput type="select" @change="user.save('admin')" v-model="user.props.admin" :options="user.options?.admin"
                            name="admin" label="Admin" class="mb-4" />
                </FieldsetItem>

                <FieldsetItem name="Preferences">

                        <FormInput type="select" @change="user.save('developer')" v-model="user.props.developer"
                            :options="user.options?.developer" label="Are you a software developer?" name="developer" class="mb-4" />

                </FieldsetItem>

                <FieldsetItem name="Profile">
                    <FormInput type="select" @change="user.save('useAsDisplayName')" v-model="user.props.useAsDisplayName"
                        :options="user.options?.useAsDisplayName" name="useAsDisplayName" label="Use As Display Name" class="mb-4" />

                    <FormInput type="markdown" @change="user.save('bio')" label="Bio"  v-model="user.props.bio" name="bio" class="mb-4"  />

                    <FormInput type="select" @change="user.save('avatarType')" v-model="user.props.avatarType"
                        :options="user.options?.avatarType" name="avatarType" label="Avatar" class="mb-4" />

                    <div class="mb-4">
                        <span class="font-medium text-900 mb-2">Profile Picture</span><br>
                        <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                    </div>
                </FieldsetItem>

                <FieldsetItem name="Statistics">
                    <div class="mb-4"><b>Id</b>: {{ user.props?.id }}
                        <CopyToClipboard :text="user.props.id" size="xs" />
                    </div>

                    <div class="mb-4">
                        <b>Created at</b>: {{ formatDateTime(user.props.createdAt) }}
                    </div>

                    <div class="mb-4">
                        <b>Updated at</b>: {{ formatDateTime(user.props.updatedAt) }}
                    </div>
                </FieldsetItem>

                <FieldsetItem name="Actions">
                    <Button @mouseDown="user.delete()" severity="danger" class="mr-2 mb-2" title="Delete" alt="Delete User"><Icon
                            name="ph:trash" class="mr-1"/> Delete</Button>
                    <Button @mouseDown="become" severity="warning" class="mr-2 mb-2" title="Become" alt="Become User">
                        <Icon name="bi:arrow-left-right" class="mr-1"/> Become</Button>
                    <NuxtLink :to="'/user/' + user.props.id + '/profile'" v-ripple>
                        <Button  severity="primary" class="mr-2 mb-2" title="View Profile">
                            <Icon name="ph:user" class="mr-1"/> View Profile
                        </Button>
                    </NuxtLink>
                </FieldsetItem>

            </FieldsetNav>
        </template>
    </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth', 'admin']
});
const route = useRoute();
const notify = useNotify();

const id = route.params.id.toString();
const user = useVingRecord({
    id,
    fetchApi: `/api/${useRestVersion()}/user/${id}`,
    createApi: `/api/${useRestVersion()}/user`,
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
            const currentUser = useCurrentUser();
            currentUser.fetch();
            await navigateTo('/');
        }
    })
}

const password = ref('');

const links = useAdminLinks();

</script>