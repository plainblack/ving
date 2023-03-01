<template>
    <div class="lg:grid lg:grid-cols-12 lg:gap-x-5 p-5">
        <UserSettingsNav />

        <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            <form>
                <div class="shadow sm:overflow-hidden sm:rounded-md">
                    <div class="space-y-6 bg-white py-6 px-4 sm:p-6">
                        <div>
                            <h3 class="text-base font-semibold leading-6 text-gray-900">Profile</h3>
                            <p class="mt-1 text-sm text-gray-500">This information will be displayed publicly so be careful
                                what you share.</p>
                        </div>

                        <div class="grid grid-cols-3 gap-6">
                            <div class="col-span-6 sm:col-span-4">
                                <VingOptionSelect v-if="currentUserStore.currentUser" @change="currentUserStore.save"
                                    v-model="currentUserStore.currentUser.props.useAsDisplayName"
                                    :options="currentUserStore.currentUser.options?.useAsDisplayName"
                                    name="useAsDisplayName" label="Use As Display Name" />
                            </div>

                            <div class="col-span-3">
                                <label class="block text-sm font-medium text-gray-700">Photo</label>
                                <div class="mt-1 flex items-center">
                                    <span class="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                        <img v-if="currentUserStore.currentUser"
                                            :src="currentUserStore.currentUser.props.avatarUrl" alt="user avatar" />
                                    </span>
                                    <button type="button"
                                        class="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Change</button>
                                </div>
                            </div>

                            <div class="col-span-3">
                                <label class="block text-sm font-medium text-gray-700">Cover photo</label>
                                <div
                                    class="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                                    <div class="space-y-1 text-center">
                                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none"
                                            viewBox="0 0 48 48" aria-hidden="true">
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <div class="flex text-sm text-gray-600">
                                            <label for="file-upload"
                                                class="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" class="sr-only" />
                                            </label>
                                            <p class="pl-1">or drag and drop</p>
                                        </div>
                                        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>



        </div>
    </div>
</template>
  
<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
});
const currentUserStore = useCurrentUserStore();
</script>