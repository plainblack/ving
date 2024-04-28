<template>
    <PanelFrame>
        <template #left>
            <PanelNav :links="links" :buttons="buttons" />
        </template>
        <template #content v-if="currentUser.props">
            <PanelZone title="Account Information" info="Your private login details.">
                <div class="mb-4">
                    <FormInput name="username" v-model="currentUser.props.username" required label="Username"
                        autocomplete="username" @change="currentUser.save('username')" />
                </div>
                <div class="mb-4">
                    <FormInput type="email" name="email" v-model="currentUser.props.email" label="Email"
                        required autocomplete="email" @change="currentUser.save('email')" />
                </div>
                <div class="mb-4">
                    <FormInput name="realName" v-model="currentUser.props.realName" label="Real Name"
                        autocomplete="name" @change="currentUser.save('realName')" />
                </div>
            </PanelZone>
            <PanelZone title="Change Password" info="Alter your credentials.">
                <Form :send="changePassword">
                    <div class="flex gap-5 flex-column-reverse md:flex-row">
                        <div class="flex-auto">
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
            </PanelZone>

        </template>
    </PanelFrame>
</template>
  
<script setup>
definePageMeta({
    middleware: ['auth']
});
const notify = useNotifyStore();
const currentUser = useCurrentUserStore();
const links = userSettingsLinks();
const buttons = userSettingsButtons();
const newPassword = ref({ password: '', password2: '' });
async function changePassword() {
    if (currentUser.props?.id) {
        currentUser.props.password = newPassword.value.password;
        await currentUser.save('password');
        newPassword.value.password = '';
        newPassword.value.password2 = '';
        notify.success('Password changed.');
    }
}
</script>