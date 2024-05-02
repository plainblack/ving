<template>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
        </div>
        <div class="surface-card p-4 border-1 surface-border border-round ">
            {{ message }}
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const message = ref('Please wait while we verify your email address.');
const currentUser = useCurrentUser();
const query = useRoute().query;
await currentUser.verifyEmail(query.verify?.toString());
if (currentUser.props?.verifiedEmail) {
    message.value = 'Email address successfully verified.';
    if (currentUser.meta?.redirectAfter)
        await navigateTo(currentUser.meta.redirectAfter);
    else
        await navigateTo('/');

}
else {
    message.value = 'Verification failed.';
}
</script>