<template>
    <div class="lg:grid lg:grid-cols-12 lg:gap-x-5 p-5">
        <UserSettingsNav />

        <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            <form>
                <div class="shadow sm:overflow-hidden sm:rounded-md">
                    <div class="space-y-6 bg-white py-6 px-4 sm:p-6">
                        <div>
                            <h3 class="text-base font-semibold leading-6 text-gray-900">Preferences</h3>
                            <p class="mt-1 text-sm text-gray-500">These settings will change your experience on the site.
                            </p>
                        </div>

                        <div class="grid grid-cols-3 gap-6">
                            <div class="col-span-6 sm:col-span-4">
                                <VingOptionSelect v-if="currentUserStore.currentUser" @change="currentUserStore.save"
                                    v-model="currentUserStore.currentUser.props.developer"
                                    :options="currentUserStore.currentUser.options?.developer"
                                    label="Are you a software developer?" name="developer" />
                            </div>

                        </div>
                    </div>

                </div>
            </form>


        </div>
    </div>
</template>

<script setup lang="ts">
const currentUserStore = useCurrentUserStore();
</script>