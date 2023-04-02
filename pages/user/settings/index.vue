<template>
    <div class="surface-ground px-4 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <UserSettingsNav />
            <div v-if="currentUser.props" class="surface-card p-5 shadow-2 border-round flex-auto">
                <div class="text-900 font-semibold text-lg mt-3">Profile</div>
                <p class="mt-1 mb-4 text-sm text-gray-500">This information will be displayed publicly so be careful
                    what you share.</p>

                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <VingOptionSelect @change="currentUser.save" v-model="currentUser.props.useAsDisplayName"
                                :options="currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                                label="Use As Display Name" />
                        </div>

                    </div>
                    <div class="flex flex-column align-items-center flex-or">
                        <span class="font-medium text-900 mb-2">Profile Picture</span>
                        <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem"
                            shape="circle" />
                        <Button type="button" icon="pi pi-pencil" class="p-button-rounded -mt-4"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
const currentUser = useCurrentUserStore();
</script>