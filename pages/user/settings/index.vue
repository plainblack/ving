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
                <div class="text-900 font-semibold text-lg mt-3">Profile</div>
                <p class="mt-1 mb-4 text-sm text-gray-500">This information will be displayed publicly so be careful
                    what you share.</p>

                <div class="flex gap-5 flex-column-reverse md:flex-row">
                    <div class="flex-auto p-fluid">
                        <div class="mb-4">
                            <VingOptionSelect v-if="currentUserStore.currentUser" @change="currentUserStore.save"
                                v-model="currentUserStore.currentUser.props.useAsDisplayName"
                                :options="currentUserStore.currentUser.options?.useAsDisplayName" name="useAsDisplayName"
                                label="Use As Display Name" />
                        </div>

                    </div>
                    <div class="flex flex-column align-items-center flex-or">
                        <span class="font-medium text-900 mb-2">Profile Picture</span>
                        <Avatar :image="currentUserStore.currentUser.props.avatarUrl" alt="user avatar"
                            class="h-10rem w-10rem" shape="circle" />
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
</script>