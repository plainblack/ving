<template>
    <div class="surface-ground px-4 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <div class="surface-card p-5 shadow-2 border-round flex-auto">
                <div class="text-900 font-semibold text-lg mt-3">User profile for {{ user.meta?.displayName }}</div>

                Created on {{ dt.formatDate(user.props?.createdAt) }}
                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">

                            {{ user.props?.realName }}

                            <button @click="user.create({ username: 'a', email: 'a@a.a' })">click</button>

                        </div>

                    </div>
                    <div class="flex flex-column align-items-center flex-or">
                        <Avatar :image="user.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
const route = useRoute();
const dt = useDateTime();
const user = ref(useVingRecord<'User'>({
    fetchApi: '/api/user/' + route.params.id,
    createApi: '/api/user',
    query: { includeMeta: true }
}));
await user.value.fetch()
</script>