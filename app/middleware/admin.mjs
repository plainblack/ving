export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUser();
    if (!currentUser.props?.admin) {
        return abortNavigation('You must be an admin to view this.');
    }
});