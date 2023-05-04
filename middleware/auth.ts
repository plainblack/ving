export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUserStore();
    const isAuthenticated = await currentUser.isAuthenticated();
    if (!isAuthenticated) {
        return await navigateTo(`/user/login?redirectAfter=${to.fullPath}`);
    }
    else if (!currentUser.props?.verifiedEmail) {
        return await navigateTo(`/user/must-verify-email?redirectAfter=${to.fullPath}`);
    }
});