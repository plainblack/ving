<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <UserSettingsNav />
            <div v-if="currentUserStore.currentUser" class="flex-auto">
                <div class="surface-card p-5 shadow-2 border-round">
                    <div class="text-900 font-semibold text-lg">Account Information</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">Your private login details.</p>

                    <div class="flex gap-5 flex-column-reverse md:flex-row">
                        <div class="flex-auto p-fluid">
                            <div class="mb-4">
                                <FormInput name="username" v-model="currentUserStore.currentUser.props.username"
                                    label="Username" autocomplete="username" />
                            </div>
                            <div class="mb-4">
                                <FormInput name="email" v-model="currentUserStore.currentUser.props.email" label="Email"
                                    autocomplete="email" />
                            </div>
                            <div class="mb-4">
                                <FormInput name="realName" @change="currentUserStore.save"
                                    v-model="currentUserStore.currentUser.props.realName" label="Real Name"
                                    autocomplete="name" />
                            </div>

                        </div>

                    </div>
                </div>
                <div class="mt-5 surface-card p-5 shadow-2 border-round">
                    <div class="text-900 font-semibold text-lg">Change Password</div>
                    <p class="mt-1 mb-4 text-sm text-gray-500">Alter your credentials.</p>

                    <Form :send="changePassword">
                        <div class="flex gap-5 flex-column-reverse md:flex-row">
                            <div class="flex-auto p-fluid">
                                <div class="mb-4">
                                    <FormInput name="password" type="password" v-model="newPassword.password" required
                                        label="New Password" autocomplete="new-password" />
                                </div>
                                <div class="mb-4">
                                    <FormInput name="password" type="password" v-model="newPassword.password2" required
                                        :mustMatch="{ field: 'New Password', value: newPassword.password }"
                                        label="Confirm New Password" autocomplete="new-password" />
                                </div>

                                <div>
                                    <Button type="submit" label="Update Profile" class="w-auto" @click="changePassword">
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Form>
                </div>
            </div>

        </div>
    </div>
</template>
  
<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
const currentUserStore = useCurrentUserStore();
const newPassword = ref({ password: '', password2: '' });
async function changePassword() {
    if (currentUserStore.currentUser) {
        currentUserStore.currentUser.props.password = newPassword.value.password;
        await currentUserStore.save();
    }
}
</script>