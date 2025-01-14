<template>
    <Title>User profile for {{ user.meta?.displayName }}</Title>
    <div v-if="user.props?.id" class="surface-card p-4 border border-surface rounded flex-auto">
        <div class="text-900 font-semibold text-lg mt-3">User profile for {{ user.meta?.displayName }}</div>

        Created on {{ formatDate(user.props?.createdAt) }}
        <div class="flex gap-5 flex-col-reverse md:flex-row">
            <div class="flex-auto">
                <div class="mb-4">

                    {{ user.props?.realName }}

                </div>
                <div class="mb-4">
                    <MarkdownView :text="user.props?.bio" />
                </div>

            </div>
            <div class="flex flex-col items-center flex-or">
                <Avatar :image="user.links?.avatarImage?.href" alt="user avatar" size="xlarge" shape="circle" />
            </div>
        </div>

    </div>
    <div class="mt-3">
        <NuxtLink v-if="currentUser.props?.admin" :to="user.links?.edit?.href" class="no-underline">
            <Button>Edit this User</Button>
        </NuxtLink>
    </div>
</template>
  
<script setup>
const route = useRoute();

const user = useVingRecord({
    fetchApi: `/api/${useRestVersion()}/users/${route.params.id}`,
    createApi: `/api/${useRestVersion()}/users`,
    query: { includeMeta: true, includeOptions: true },
});
await user.fetch()

onBeforeRouteLeave(() => user.dispose());

const currentUser = useCurrentUser();


</script>