<template>
    <Title>Verify email for {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
        </div>
        <PanelZone>
            {{ message }}
        </PanelZone>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const currentUser = useCurrentUser();
if (await currentUser.isAuthenticated()) {
    const message = ref('Please wait while we verify your email address.');
    const query = useRoute().query;
    await currentUser.verifyEmail(query.verify?.toString());
    if (currentUser.props?.verifiedEmail) {
        message.value = 'Email address successfully verified.';
        if (currentUser.meta?.redirectAfter && !currentUser.meta?.redirectAfter?.match(/verify-email/))
            await navigateTo(currentUser.meta.redirectAfter);
        else
           await navigateTo('/');
    }
    else {
        message.value = 'Verification failed.';
    }
}
else {
    await navigateTo('/user/login')
}

</script>