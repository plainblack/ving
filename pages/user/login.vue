<template>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
            <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
            <span class="text-600 font-medium line-height-3">Don't have an account?</span>
            <NuxtLink to="/user/create" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create one today!
            </NuxtLink>
        </div>
        <div class="surface-card p-4 border-1 surface-border border-round ">

            <Form :send="tryLogin">
                <FormInput name="login" v-model="login" id="login1" required label="Email or Username" autocomplete="email"
                    class="mb-3" />

                <FormInput name="password" v-model="password" required label="Password" autocomplete="current-password"
                    type="password" class="mb-3" />

                <Button type="submit" icon="pi pi-user" class="w-full">Sign In with Password</Button>
            </Form>

            <div class="mt-3">
                <span class="text-600 font-medium line-height-3">Forgot your password?</span>
                <NuxtLink to="/user/reset-password" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Reset
                    your
                    password.
                </NuxtLink>
            </div>

            <Divider align="center" class="my-4">
                <span class="text-600 font-normal text-sm">OR</span>
            </Divider>

            <div class="flex justify-content-between">
                <Button
                    class="mr-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <Icon name="prime:facebook" class="text-indigo-500 mr-2" size="50px" />
                    <span>Sign in With Facebook</span>
                </Button>
                <Button
                    class="ml-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <Icon name="prime:github" class="text-black-500 mr-2" size="50px" />
                    <span>Sign in With GitHub</span>
                </Button>
                <Button
                    class="ml-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <Icon name="prime:google" class="text-red-500 mr-2" size="50px" />
                    <span>Sign in With Google</span>
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { isString } from '#ving/utils/identify.mjs';
let login = ref('');
let password = ref('');
const config = useRuntimeConfig();
const currentUser = useCurrentUserStore();

async function tryLogin() {
    const response = await currentUser.login(login.value, password.value);
    const query = useRoute().query;
    if (!response.error)
        if (isString(query.redirectAfter))
            await navigateTo(query.redirectAfter)
        else
            await navigateTo('/');
}
</script>