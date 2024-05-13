<template>
    <Title>Must verify email for {{ config.public?.site?.name }}</Title>
    <div class="w-full lg:w-7 mx-auto">
        <div class="text-center mb-5">
            <img :src="config.public.site.logoUrl" :alt="config.public.site.name" height="50" class="mb-3">
        </div>
        <PanelZone>
            You cannot continue to this content until you have verified your email address. We've sent you an email with a
            link to verify. Please check your email to continue.
        </PanelZone>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
onMounted(async () => {
    const currentUser = useCurrentUser();
    const query = useRoute().query;
    await currentUser.sendVerifyEmail(query.redirectAfter?.toString());
});
</script>