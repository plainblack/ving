<template>
    <Title>User profile for {{ user.meta?.displayName }}</Title>
    <div v-if="user.props?.id" class="surface-card p-4 border-1 surface-border border-round flex-auto">
        <div class="text-900 font-semibold text-lg mt-3">User profile for {{ user.meta?.displayName }}</div>

        Created on {{ formatDate(user.props?.createdAt) }}
        <div class="flex gap-5 flex-column-reverse md:flex-row">
            <div class="flex-auto">
                <div class="mb-4">

                    {{ user.props?.realName }}

                </div>
                <div class="mb-4">
                    <MarkdownView :text="user.props?.bio" />
                </div>

            </div>
            <div class="flex flex-column align-items-center flex-or">
                <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
            </div>
        </div>

    </div>
    <div class="mt-3">
        <NuxtLink v-if="currentUser.props?.admin" :to="`/user/admin/${user.props?.id}`" class="no-underline">
            <Button>Edit this User</Button>
        </NuxtLink>
    </div>
</template>
  
<script setup>
const route = useRoute();

const user = useVingRecord({
    fetchApi: `/api/${useRestVersion()}/user/${route.params.id}`,
    createApi: `/api/${useRestVersion()}/user`,
    query: { includeMeta: true, includeOptions: true },
});
await user.fetch()

onBeforeRouteLeave(() => user.dispose());

const currentUser = useCurrentUser();


</script>