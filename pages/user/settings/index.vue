<template>
    <Title>User Profile Settings</Title>
    <PanelFrame>
        <template #left>
            <PanelNav :links="links" :buttons="buttons" />
        </template>
        <template #content v-if="currentUser.props">
            <PanelZone title="Profile" info="This information will be displayed publicly so be careful what you share.">
                
                <FormInput type="select" @change="currentUser.save('useAsDisplayName')" v-model="currentUser.props.useAsDisplayName"
                    :options="currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                    label="Use As Display Name" class="mb-4" />

                <div class="grid">
                    <div class="col">
                        <FormInput type="select" @change="currentUser.save('avatarType')" v-model="currentUser.props.avatarType"
                            :options="currentUser.options?.avatarType" name="avatarType" label="Avatar" class="mb-4" />
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
                
                <FormInput type="markdown" @change="currentUser.save('bio')" label="Bio"  v-model="currentUser.props.bio" name="bio" class="mb-4"  />

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
const currentUser = useCurrentUser();
const links = useUserSettingsLinks();
const buttons = useUserSettingsButtons();
</script>