<template>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
        </div>
        <div class="surface-card p-4 border-1 surface-border border-round ">
            <h1 class="mt-0">Reset Passsword</h1>
            <Form :send="resetPassword">
                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <FormInput name="code" type="text" v-model="newPassword.code" required readonly
                                label="Reset Code" />
                        </div>
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
                                Reset Password
                            </Button>
                        </div>
                    </div>

                </div>
            </Form>
        </div>
    </div>
</template>

<script setup>
const route = useRoute();
const query = route.query;
const newPassword = reactive({ password: '', password2: '', code: query.code?.toString() || '' });
const config = useRuntimeConfig();
const notify = useNotifyStore();
async function resetPassword() {
    notify.info('Please wait while we reset your password...');
    const response = await useRest(`/api/${restVersion()}/user/${route.params.id}/reset-password`, {
        method: 'post',
        query: { includeOptions: true },
        body: { code: newPassword.code, password: newPassword.password },
    });
    if (!response.error) {
        notify.success('Password changed.');
        await navigateTo('/user/login');
    }
}
</script>