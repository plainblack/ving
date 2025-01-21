<template>
    <Title>Log in to {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7/12 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" class="inline-block h-16 mb-3">
            <h1 class="text-900 text-3xl font-medium mb-3 mt-0">Welcome Back</h1>
            <span class="text-600 font-medium line-height-3">Don't have an account?</span>
            <NuxtLink to="/users/create" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create one today!
            </NuxtLink>
        </div>
        <PanelZone>

            <VForm :send="tryLogin">
                <FormInput name="login" v-model="login" id="login1" required label="Email or Username" autocomplete="email"
                    class="mb-3" />

                <FormInput name="password" v-model="password" required label="Password" autocomplete="current-password"
                    type="password" class="mb-3" />

                    <Button type="submit" class="w-full"><span class="text-center w-full"><Icon name="ph:user" class="mr-1"/><span class="align-middle">Sign in with Password</span></span></Button>
            </VForm>

            <div class="mt-3">
                <span class="text-600 font-medium line-height-3">Forgot your password?</span>
                <NuxtLink to="/users/reset-password" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Reset
                    your
                    password.
                </NuxtLink>
            </div>

            <Divider align="center" class="my-4">
                <span class="text-600 font-normal text-sm">OR</span>
            </Divider>

            <div class="flex justify-between">
                <Button class="mr-2">
                    <Icon name="prime:facebook" class="mr-2" size="3rem" />
                    <span>Sign in With Facebook</span>
                </Button>
                <Button>
                    <Icon name="prime:github" class="mr-2" size="3rem" />
                    <span>Sign in With GitHub</span>
                </Button>
                <Button class="ml-2">
                    <Icon name="prime:google" class="mr-2" size="3rem" />
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