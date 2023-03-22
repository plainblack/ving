<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <UserSettingsNav />
            <div v-if="currentUser.props" class="flex-auto">
                <div class="surface-card p-5 shadow-2 border-round">
                    <div class="text-900 font-semibold text-lg">API Keys</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">You can use API Keys to interact with the API.</p>

                    <div class="flex gap-5 flex-column-reverse md:flex-row">
                        <div class="flex-auto p-fluid">
                            <div class="mb-4">


                                table of api keys goes here

                            </div>
                        </div>



                    </div>
                </div>
                <div class="mt-5 surface-card p-5 shadow-2 border-round">
                    <div class="text-900 font-semibold text-lg">Create API Key</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">Make a new API Key.</p>

                    <!-- Form :send="apikeys.create()">
                        <div class="flex gap-5 flex-column-reverse md:flex-row">
                            <div class="flex-auto p-fluid">
                                <div class="mb-4">
                                    <FormInput name="name" type="text" v-model="apikeys.new.name" required label="Name" />
                                </div>
                                <div class="mb-4">
                                    <FormInput name="url" type="text" v-model="apikeys.new.url" required label="URL" />
                                </div>
                                <div class="mb-4">
                                    <FormInput name="reason" type="textarea" v-model="apikeys.new.reason" required
                                        label="Reason" />
                                </div>

                                <div>
                                    <Button type="submit" label="Update Profile" class="w-auto">
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Form -->
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
/*
const apikeys = ref(useVingRecordList<'User'>({
    listApi: '/api/apikey',
    createApi: '/api/apikey',
    query: { includeMeta: true }
}));
await apikeys.all();*/


const currentUser = useCurrentUserStore();
</script>