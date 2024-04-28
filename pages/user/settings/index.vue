<template>
        <PanelFrame>
            <template #left>
                <PanelNav :links="links" :buttons="buttons" />
            </template>
            <template #content v-if="currentUser.props">
                <PanelZone title="Profile" info="This information will be displayed publicly so be careful what you share.">
                    
                    <div class="mb-4">
                        <FormInput type="select" @change="currentUser.save('useAsDisplayName')" v-model="currentUser.props.useAsDisplayName"
                            :options="currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                            label="Use As Display Name" />
                    </div>

                    <div class="grid">
                        <div class="col">
                            <div class="mb-4">
                                <FormInput type="select" @change="currentUser.save('avatarType')" v-model="currentUser.props.avatarType"
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
                        <FormInput type="markdown" @change="currentUser.save('bio')" label="Bio"  v-model="currentUser.props.bio" name="bio"  />
                    </div>

                    <NuxtLink :to="'/user/' + currentUser.props.id + '/profile'" v-ripple>
                        View your profile as others see it
                    </NuxtLink>
                </PanelZone>
        </template>
    </PanelFrame>
</template>

<script setup>
definePageMeta({
    middleware: ['auth']
});
const currentUser = useCurrentUserStore();
const links = userSettingsLinks();
const buttons = userSettingsButtons();
</script>