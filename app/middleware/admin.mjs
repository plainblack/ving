export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUser();
    if (!currentUser.props?.admin) {
        return abortNavigation({ statusCode: 403, fatal: true, message: 'You must be an admin to view this.' });
    }
});