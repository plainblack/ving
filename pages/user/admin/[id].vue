<template>
    <Crumbtrail :crumbs="breadcrumbs" class="shadow-2" />
    <div class="mt-5 surface-ground">
        <div v-if="user.props" class="surface-card p-5 shadow-2 border-round flex-auto">
            <h1 class="mt-0">Edit User {{ user.props.username }}</h1>

            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">
                    <div class="mb-4">
                        <FormInput name="username" v-model="user.props.username" required label="Username"
                            @change="user.update" />
                    </div>
                    <div class="mb-4">
                        <FormInput type="email" name="email" v-model="user.props.email" label="Email" required
                            @change="user.update" />
                    </div>
                    <div class="mb-4">
                        <FormInput name="realName" v-model="user.props.realName" label="Real Name" @change="user.update" />
                    </div>

                    <div class="mb-4">
                        <FormInput name="password" v-model="user.props.password" label="Password" @change="user.update" />
                    </div>

                </div>
            </div>
        </div>
    </div>
    <div class="surface-ground mt-5">
        <div v-if="user.props" class="surface-card p-5 shadow-2 border-round flex-auto">
            <h2 class="mt-0">Privileges</h2>

            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">


                    <div class="mb-4">
                        <VingOptionSelect @change="user.update" v-model="user.props.admin" :options="user.options?.admin"
                            name="admin" label="Admin" />
                    </div>

                </div>

            </div>
        </div>
    </div>
    <div class="surface-ground mt-5">
        <div v-if="user.props" class="surface-card p-5 shadow-2 border-round flex-auto">
            <h2 class="mt-0">Preferences</h2>

            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">


                    <div class="mb-4">
                        <VingOptionSelect @change="user.update" v-model="user.props.useAsDisplayName"
                            :options="user.options?.useAsDisplayName" name="useAsDisplayName" label="Use As Display Name" />
                    </div>

                    <div class="mb-4">
                        <VingOptionSelect @change="user.update" v-model="user.props.developer"
                            :options="user.options?.developer" label="Are you a software developer?" name="developer" />
                    </div>

                </div>
                <div class="flex flex-column align-items-center flex-or">
                    <span class="font-medium text-900 mb-2">Profile Picture</span>
                    <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                </div>
            </div>
        </div>
    </div>
    <div class="surface-ground mt-5">
        <div v-if="user.props" class="surface-card p-5 shadow-2 border-round flex-auto">
            <h2 class="mt-0">Statistics</h2>

            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">


                    <div class="mb-4">
                        Created at {{ dt.formatDateTime(user.props.createdAt) }}
                    </div>

                    <div class="mb-4">
                        Updated at {{ dt.formatDateTime(user.props.updatedAt) }}
                    </div>

                </div>

            </div>
        </div>
    </div>
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
    }
});

const breadcrumbs = [
    { label: 'Admin', to: '/admin' },
    { label: 'Users', to: '/user/admin' },
    { label: 'Edit User' },
];

await user.fetch()
</script>