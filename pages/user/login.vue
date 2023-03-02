<template>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.logoUrl" :alt="config.public.companyName" height="50" class="mb-3">
            <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
            <span class="text-600 font-medium line-height-3">Don't have an account?</span>
            <NuxtLink to="/user/create" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer">Create one today!
            </NuxtLink>
        </div>
        <div class="surface-card p-4 shadow-2 border-round ">

            <div>
                <label for="login2" class="block text-900 font-medium mb-2">Email or Username</label>
                <InputText v-model="login" id="login2" type="text" placeholder="Email address or Username"
                    class="w-full mb-3" autocomplete="email" required />

                <Button label="Sign In with Magic Link" icon="pi pi-envelope" class="w-full"></Button>
            </div>


            <Divider align="center" class="my-4">
                <span class="text-600 font-normal text-sm">OR</span>
            </Divider>


            <form @submit.prevent="tryLogin">
                <label for="login1" class="block text-900 font-medium mb-2">Email or Username</label>
                <InputText v-model="login" id="login1" type="text" placeholder="Email address or Username"
                    class="w-full mb-3" autocomplete="email" required />

                <label for="password1" class="block text-900 font-medium mb-2">Password</label>
                <InputText v-model="password" id="password1" type="password" placeholder="Password" class="w-full mb-3"
                    autocomplete="current-password" required />

                <Button type="submit" label="Sign In with Password" icon="pi pi-user" class="w-full"></Button>
            </form>

            <Divider align="center" class="my-4">
                <span class="text-600 font-normal text-sm">OR</span>
            </Divider>


            <div class="flex justify-content-between">
                <Button
                    class="mr-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <i class="pi pi-facebook text-indigo-500 mr-2"></i>
                    <span>Sign in With Facebook</span>
                </Button>
                <Button
                    class="ml-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <i class="pi pi-github text-black-500 mr-2"></i>
                    <span>Sign in With GitHub</span>
                </Button>
                <Button
                    class="ml-2 w-6 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center">
                    <i class="pi pi-google text-red-500 mr-2"></i>
                    <span>Sign in With Google</span>
                </Button>
            </div>
        </div>
    </div>
</template>




<script setup lang="ts">
let login = ref('');
let password = ref('');
const config = useRuntimeConfig();
const currentUserStore = useCurrentUserStore();

async function tryLogin() {
    try {
        await currentUserStore.login(login.value, password.value);
        navigateTo('/');
    }
    catch (e) {
        if (e !== undefined && typeof (e) == 'object' && e !== null && 'message' in e) {
            alert(e.message);
        }
        else {
            alert(e)
        }
    }
}
</script>