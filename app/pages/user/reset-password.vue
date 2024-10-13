<template>
    <Title>Send password reset for {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7/12 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" class="inline-block h-16 mb-3">
            <h1 class="text-900 text-3xl font-medium mb-3 mt-0">Send Password Reset</h1>
            <span class="text-600 font-medium line-height-3">Remember your account?</span>
            <NuxtLink to="/user/login" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Sign in
            </NuxtLink>
        </div>
        <PanelZone info="Where should we send the password reset email?">
            <Form :send="sendPasswordReset">
                <div class="flex gap-5 flex-col-reverse md:flex-row">
                    <div class="flex-auto">
                        <FormInput name="email" type="email" v-model="email" required label="Email Address" class="mb-4" />

                        <Button type="submit" label="Update Profile" class="w-auto">
                            Send Reset Password Email
                        </Button>
                    </div>

                </div>
            </Form>
        </PanelZone>
    </div>
</template>

<script setup>
import ua from 'ua-parser-js';
import { sleep } from '#ving/utils/sleep.mjs';
const config = useRuntimeConfig();
const email = ref('')
const notify = useNotify();
async function sendPasswordReset() {
    const parser = new ua(navigator.userAgent);
    const response = await useRest(`/api/${useRestVersion()}/user/send-password-reset`, {
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