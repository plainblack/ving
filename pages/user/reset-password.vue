<template>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
        </div>
        <div class="surface-card p-4 border-1 surface-border border-round ">
            <h1 class="mt-0">Reset Passsword</h1>
            <p>Where should we send the password reset email?</p>
            <Form :send="sendPasswordReset">
                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <FormInput name="email" type="email" v-model="email" required label="Email Address" />
                        </div>

                        <div>
                            <Button type="submit" label="Update Profile" class="w-auto">
                                Send Reset Password Email
                            </Button>
                        </div>
                    </div>

                </div>
            </Form>
        </div>

    </div>
</template>

<script setup>
import ua from 'ua-parser-js';
import { sleep } from '#ving/utils/sleep.mjs';
const config = useRuntimeConfig();
const email = ref('')
const notify = useNotifyStore();
async function sendPasswordReset() {
    const parser = new ua(navigator.userAgent);
    const response = await useRest(`/api/${restVersion()}/user/send-password-reset`, {
        method: 'post',
        query: { includeOptions: true },
        body: { browser: parser.getBrowser().name, os: parser.getOS().name, email: email.value }
    });
    if (!response.error) {
        notify.info('Check your email for the reset link.');
        await sleep(1000 * 5);
        await navigateTo('/');
    }
}
</script>