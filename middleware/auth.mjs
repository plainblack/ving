export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUser();
    const isAuthenticated = await currentUser.isAuthenticated();
    if (!isAuthenticated) {
        return await navigateTo(`/user/login?redirectAfter=${to.fullPath}`);
    }
    else if (!currentUser.props?.verifiedEmail) {
        if (to.fullPath != '/user/logout') {
            return await navigateTo(`/user/must-verify-email?redirectAfter=${to.fullPath}`);
        }
    }
});