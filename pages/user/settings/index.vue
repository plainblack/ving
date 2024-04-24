<template>
    <div class="surface-ground px-4 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <UserSettingsNav />
            <div v-if="currentUser.props" class="surface-card p-5 border-1 surface-border border-round flex-auto">
                <div class="text-900 font-semibold text-lg mt-3">Profile</div>
                <p class="mt-1 mb-4 text-sm text-gray-500">This information will be displayed publicly so be careful
                    what you share.</p>

                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <FormInput type="select" @change="currentUser.update()" v-model="currentUser.props.useAsDisplayName"
                                :options="currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                                label="Use As Display Name" />
                        </div>
                        <div class="mb-4">
                            <FormInput type="select" @change="currentUser.update()" v-model="currentUser.props.avatarType"
                                :options="currentUser.options?.avatarType" name="avatarType" label="Avatar Type" />
                        </div>
                        <div v-if="currentUser.props.avatarType == 'uploaded'" class="mb-4">
                            <client-only>
                                <Dropzone :acceptedFiles="currentUser.meta?.acceptedFileExtensions?.avatar"
                                    :afterUpload="currentUser.importAvatar" :maxFiles="1" :resizeHeight="300"
                                    :resizeWidth="300" resizeMethod="crop"></Dropzone>
                            </client-only>
                        </div>
                        <div class="mb-4">
                            <FormInput type="markdown" @change="currentUser.update()" label="Bio"  v-model="currentUser.props.bio" name="bio"  />
                        </div>

                    </div>
                    <div class="flex flex-column align-items-center flex-or">
                        <span class="font-medium text-900 mb-2">Avatar</span>
                        <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem"
                            shape="circle" />
                    </div>
                </div>

                <NuxtLink :to="'/user/' + currentUser.props.id + '/profile'" v-ripple>
                    View your profile as others see it
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});
const currentUser = useCurrentUserStore();
</script>