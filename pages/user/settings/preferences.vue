<template>
    <div class="surface-ground px-4 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <UserSettingsNav />
            <div v-if="currentUser.props" class="flex-auto">
                <div class="surface-card p-5 border-1 surface-border border-round">
                    <div class="text-900 font-semibold text-lg">Preferences</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">These settings will change your experience on the site.</p>

                    <div class="flex gap-5 flex-column-reverse md:flex-row">
                        <div class="flex-auto p-fluid">
                            <div class="mb-4">
                                <FormInput type="select" @change="currentUser.update()" v-model="currentUser.props.developer"
                                    :options="currentUser.options?.developer" label="Are you a software developer?"
                                    name="developer" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});
const currentUser = useCurrentUserStore();
</script>