<template>
    <div class="surface-ground px-4 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <PanelNav :links="links" :buttons="buttons" />
            <div v-if="currentUser.props" class="surface-card p-5 border-1 surface-border border-round flex-auto">
                <div class="text-900 font-semibold text-lg">Profile</div>
                <p class="mt-1 mb-4 text-sm text-gray-500">This information will be displayed publicly so be careful
                    what you share.</p>

               
                        <div class="mb-4">
                            <FormInput type="select" @change="currentUser.update()" v-model="currentUser.props.useAsDisplayName"
                                :options="currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                                label="Use As Display Name" />
                        </div>

                        <div class="grid">
                            <div class="col">
                                <div class="mb-4">
                                    <FormInput type="select" @change="currentUser.update()" v-model="currentUser.props.avatarType"
                                        :options="currentUser.options?.avatarType" name="avatarType" label="Avatar" />
                                </div>
                                <div v-if="currentUser.props.avatarType == 'uploaded'" class="mb-4">
                                    <Dropzone id="avatar" :acceptedFiles="currentUser.meta?.acceptedFileExtensions?.avatar"
                                        :afterUpload="currentUser.importAvatar" :maxFiles="1" :resizeHeight="300"
                                        :resizeWidth="300" resizeMethod="crop"></Dropzone>
                                </div>
                            </div>
                            <div class="col text-center">
                                <Avatar :image="currentUser.meta?.avatarUrl" alt="user avatar" class="h-10rem w-10rem" shape="circle" />
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <FormInput type="markdown" @change="currentUser.update()" label="Bio"  v-model="currentUser.props.bio" name="bio"  />
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
const links = userSettingsLinks();
const buttons = userSettingsButtons();
</script>