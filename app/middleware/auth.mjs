export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUser();
    const isAuthenticated = await currentUser.isAuthenticated();
    if (!isAuthenticated) {
        return await navigateTo(`/users/login?redirectAfter=${to.fullPath}`);
    }
    else if (!currentUser.props?.verifiedEmail) {
        if (to.fullPath != '/users/logout') {
            return await navigateTo(`/users/must-verify-email?redirectAfter=${to.fullPath}`);
        }
    }
});