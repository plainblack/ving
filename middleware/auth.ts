export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUserStore = useCurrentUserStore();
    const isAuthenticated = await currentUserStore.isAuthenticated();
    if (!isAuthenticated) {
        return navigateTo(`/user/login?redirectAfter=${to.fullPath}`);
    }
});