<template>
    <Title>Create an Account for {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
            <h1 class="text-900 text-3xl font-medium mb-3 mt-0">Create an Account</h1>
            <span class="text-600 font-medium line-height-3">Already have an account?</span>
            <NuxtLink to="/user/login" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Sign in
            </NuxtLink>
        </div>
        <PanelZone>
            <Form :send="createAccount">
                <FormInput name="username" v-model="newUser.username" required label="Username" autocomplete="username"
                    type="text" class="mb-3" />

                <FormInput name="realName" v-model="newUser.realName" required label="Real Name" autocomplete="name"
                    type="text" class="mb-3" />

                <FormInput name="email" v-model="newUser.email" required label="Email" autocomplete="email" type="email"
                    class="mb-3" />

                <FormInput name="password" v-model="newUser.password" required label="Password" autocomplete="new-password"
                    type="password" class="mb-3" />

                <FormInput name="password2" v-model="newUser.password2" required label="Confirm Password"
                    autocomplete="new-password" type="password" :mustMatch="{ field: 'Password', value: newUser.password }"
                    class="mb-3" />

                    <Button type="submit" class="w-full"><span class="text-center w-full"><Icon name="ph:user" class="mr-1"/><span class="vertical-align-middle">Create Account</span></span></Button>
            </Form>

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
let newUser = ref({ username: '', email: '', realName: '', password: '', password2: '' });
const config = useRuntimeConfig();
const currentUser = useCurrentUser();

async function createAccount() {
    const response = await currentUser.create(newUser.value);
    if (!response.error)
        await navigateTo('/');
}
</script>