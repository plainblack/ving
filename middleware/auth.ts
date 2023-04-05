export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUserStore = useCurrentUserStore();
    const isAuthenticated = await currentUserStore.isAuthenticated();
    console.log(to);
    if (!isAuthenticated) {
        return navigateTo(`/user/login?redirectAfter=${to.fullPath}`);
    }
});