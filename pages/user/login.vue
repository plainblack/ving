<template>
    <Title>Log in to {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
            <h1 class="text-900 text-3xl font-medium mb-3 mt-0">Welcome Back</h1>
            <span class="text-600 font-medium line-height-3">Don't have an account?</span>
            <NuxtLink to="/user/create" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create one today!
            </NuxtLink>
        </div>
        <PanelZone>

            <Form :send="tryLogin">
                <FormInput name="login" v-model="login" id="login1" required label="Email or Username" autocomplete="email"
                    class="mb-3" />

                <FormInput name="password" v-model="password" required label="Password" autocomplete="current-password"
                    type="password" class="mb-3" />

                    <Button type="submit" class="w-full"><span class="text-center w-full"><Icon name="ph:user" class="mr-1"/><span class="vertical-align-middle">Sign in with Password</span></span></Button>
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
        </PanelZone>
    </div>
</template>

<script setup>
import { isString } from '#ving/utils/identify.mjs';
let login = ref('');
let password = ref('');
const config = useRuntimeConfig();
const currentUser = useCurrentUser();

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