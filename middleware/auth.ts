export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUserStore = useCurrentUserStore();
    const isAuthenticated = await currentUserStore.isAuthenticated();
    if (!isAuthenticated) {
        return await navigateTo(`/user/login?redirectAfter=${to.fullPath}`);
    }
});