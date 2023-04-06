<template>
    <Crumbtrail :crumbs="breadcrumbs" />
    <h1>Edit User {{ user.props?.username }}</h1>



    <div class="grid">
        <div class="col-12 md:col-9 xl:col-10" v-if="user.props">


            <Fieldset legend="Account" :toggleable="true" id="Account" class="mb-3">
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
                    <FormInput name="password" v-model="password" label="Password"
                        @change="user._partialUpdate({ password: password })" />
                </div>
            </Fieldset>

            <Fieldset legend="Privileges" :toggleable="true" id="Privileges" class="mb-3">
                <div class="mb-4">
                    <VingOptionSelect @change="user.update" v-model="user.props.admin" :options="user.options?.admin"
                        name="admin" label="Admin" />
                </div>
            </Fieldset>

            <Fieldset legend="Preferences" :toggleable="true" id="Preferences" class="mb-3">
                <div class="mb-4">
                    <VingOptionSelect @change="user.update" v-model="user.props.useAsDisplayName"
                        :options="user.options?.useAsDisplayName" name="useAsDisplayName" label="Use As Display Name" />
                </div>

                <div class="mb-4">
                    <VingOptionSelect @change="user.update" v-model="user.props.developer"
                        :options="user.options?.developer" label="Are you a software developer?" name="developer" />
                </div>

                <div class="mb-4">
                    <span class="font-medium text-900 mb-2">Profile Picture</span><br>
                    <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                </div>
            </Fieldset>

            <Fieldset legend="Statistics" :toggleable="true" id="Statistics" class="mb-3">
                <div class="mb-4">
                    Created at {{ dt.formatDateTime(user.props.createdAt) }}
                </div>

                <div class="mb-4">
                    Updated at {{ dt.formatDateTime(user.props.updatedAt) }}
                </div>
            </Fieldset>


        </div>
        <div class="hidden md:block md:col-3 xl:col-2">
            <ul class="list-none sticky m-0 p-0 top-0">
                <li class="mb-2"><a href="#Account">Account</a></li>
                <li class="mb-2"><a href="#Privileges">Privileges</a></li>
                <li class="mb-2"><a href="#Preferences">Preferences</a></li>
                <li class="mb-2"><a href="#Statistics">Statistics</a></li>
            </ul>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import Fieldset from 'primevue/fieldset';
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
});

const password = ref('');

const breadcrumbs = [
    // { label: 'Admin', to: '/admin' },
    { label: 'Users', to: '/user/admin' },
    { label: 'Edit User' },
];

await user.fetch()
</script>