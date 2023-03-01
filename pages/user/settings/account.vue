<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="p-fluid flex flex-column lg:flex-row">
            <ul
                class="list-none m-0 p-0 flex flex-row lg:flex-column justify-content-evenly md:justify-content-between lg:justify-content-start mb-5 lg:pr-8 lg:mb-0">
                <li>
                    <a v-ripple
                        class="flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-user md:mr-2"></i>
                        <span class="font-medium hidden md:block">Profile</span>
                    </a>
                </li>
                <li>
                    <a v-ripple
                        class="flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-cog md:mr-2"></i>
                        <span class="font-medium hidden md:block">Account</span>
                    </a>
                </li>
                <li>
                    <a v-ripple
                        class="flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-palette md:mr-2"></i>
                        <span class="font-medium hidden md:block">Appearance</span>
                    </a>
                </li>
                <li>
                    <a v-ripple
                        class="flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-sun md:mr-2"></i>
                        <span class="font-medium hidden md:block">Accessibility</span>
                    </a>
                </li>
                <li>
                    <a v-ripple
                        class="flex align-items-center cursor-pointer p-3 border-round text-800 hover:surface-hover transition-duration-150 transition-colors p-ripple">
                        <i class="pi pi-bell md:mr-2"></i>
                        <span class="font-medium hidden md:block">Notifications</span>
                    </a>
                </li>
            </ul>
            <div v-if="currentUserStore.currentUser" class="surface-card p-5 shadow-2 border-round flex-auto">
                <div class="text-900 font-semibold text-lg mt-3">Account Information</div>
                <p class="mt-1 mb-4 text-sm text-gray-500">Your private login details.</p>

                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <label for="email" class="block font-medium text-900 mb-2">Name</label>
                            <InputText id="email" type="text" />
                        </div>
                        <div class="mb-4">
                            <label for="bio" class="block font-medium text-900 mb-2">Bio</label>
                            <Textarea id="bio" type="text" rows="5" :autoResize="true"></Textarea>
                        </div>
                        <div class="mb-4">
                            <label for="website" class="block font-medium text-900 mb-2">URL</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">https://</span>
                                <InputText id="website" type="text" />
                            </div>
                        </div>
                        <div class="mb-4">
                            <label for="state" class="block font-medium text-900 mb-2">Company</label>
                            <InputText id="state" type="text" />
                        </div>
                        <div>
                            <Button label="Update Profile" class="w-auto"></Button>
                        </div>
                    </div>
                    <div class="flex flex-column align-items-center flex-or">
                        <span class="font-medium text-900 mb-2">Profile Picture</span>
                        <img :src="currentUserStore.currentUser.props.avatarUrl" alt="user avatar"
                            class="h-10rem w-10rem" />
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
const currentUserStore = useCurrentUserStore();
const newPassword = ref({ password: '', password2: '' });
async function changePassword() {
    if (currentUserStore.currentUser) {
        currentUserStore.currentUser.props.password = newPassword.value.password;
        await currentUserStore.save();
    }
}
</script>