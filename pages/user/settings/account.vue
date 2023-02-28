<template>
    <div class="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <UserSettingsNav />

        <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            <form>
                <div class="shadow sm:overflow-hidden sm:rounded-md">
                    <div class="space-y-6 bg-white py-6 px-4 sm:p-6">

                        <div>
                            <h3 class="text-base font-semibold leading-6 text-gray-900">Account Information</h3>
                            <p class="mt-1 text-sm text-gray-500">Your private login details.</p>
                        </div>

                        <div class="grid grid-cols-3 gap-6">
                            {{ currentUserStore.currentUser && currentUserStore.currentUser.props.username }}
                            <div class="col-span-6 sm:col-span-4">
                                <FormInput name="username" v-if="currentUserStore.currentUser"
                                    v-model="currentUserStore.currentUser.props.username" label="Username"
                                    autocomplete="username" />
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <FormInput name="email" v-if="currentUserStore.currentUser"
                                    v-model="currentUserStore.currentUser.props.email" label="Email" autocomplete="email" />
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <FormInput name="realName" v-if="currentUserStore.currentUser"
                                    @change="currentUserStore.save" v-model="currentUserStore.currentUser.props.realName"
                                    label="Real Name" autocomplete="name" />
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