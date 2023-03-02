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
                                <FormInput name="username" v-model="currentUserStore.currentUser.props.username" required
                                    label="Username" autocomplete="username" @change="currentUserStore.save" />
                            </div>
                            <div class="mb-4">
                                <FormInput type="email" name="email" v-model="currentUserStore.currentUser.props.email"
                                    label="Email" required autocomplete="email" @change="currentUserStore.save" />
                            </div>
                            <div class="mb-4">
                                <FormInput name="realName" v-model="currentUserStore.currentUser.props.realName"
                                    label="Real Name" autocomplete="name" @change="currentUserStore.save" />
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
                                    <Button type="submit" label="Update Profile" class="w-auto">
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
const notify = useNotifyStore();
const currentUserStore = useCurrentUserStore();
const newPassword = ref({ password: '', password2: '' });
async function changePassword() {
    if (currentUserStore.currentUser) {
        currentUserStore.currentUser.props.password = newPassword.value.password;
        await currentUserStore.save();
        newPassword.value.password = '';
        newPassword.value.password2 = '';
        notify.success('Password changed.');
    }
}
</script>