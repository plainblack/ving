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


            <form>
                <div class="shadow sm:overflow-hidden sm:rounded-md">
                    <div class="space-y-6 bg-white py-6 px-4 sm:p-6">
                        <div>
                            <h3 class="text-base font-semibold leading-6 text-gray-900">Change Password</h3>
                            <p class="mt-1 text-sm text-gray-500">Alter your credentials.</p>
                        </div>

                        <div class="grid grid-cols-3 gap-6">

                            <div class="col-span-6 sm:col-span-4">
                                <FormInput name="password" type="password" v-model="newPassword.password"
                                    label="New Password" autocomplete="new-password" />
                            </div>

                            <div class="col-span-6 sm:col-span-4">
                                <FormInput name="password" type="password" v-model="newPassword.password2"
                                    label="Confirm New Password" autocomplete="new-password" />
                            </div>

                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">

                        <div v-if="newPassword.password == '' || newPassword.password !== newPassword.password2"
                            class="rounded-md bg-red-50 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <font-awesome-icon icon="fa-solid fa-circle-x" class="h-5 w-5 text-red-400"
                                        aria-hidden="true" />
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">Your new password has not met these
                                        requirements</h3>
                                    <div class="mt-2 text-sm text-red-700">
                                        <ul role="list" class="list-disc space-y-1 pl-5">
                                            <li v-if="newPassword.password == ''">New password is required.</li>
                                            <li v-if="newPassword.password !== newPassword.password2">Your new passwords do
                                                not
                                                match.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button v-else type="submit" @click="changePassword"
                            class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            Change Password
                        </button>
                    </div>
                </div>
            </form>

        </div>
    </div>
</template>
  
<script setup lang="ts">
const currentUserStore = useCurrentUserStore();
const newPassword = ref({ password: '', password2: '' });
async function changePassword() {
    if (currentUserStore.currentUser) {
        currentUserStore.currentUser.props.password = newPassword.value.password;
        await currentUserStore.save();
    }
}
</script>