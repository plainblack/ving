export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUserStore();
    if (!currentUser.props?.admin) {
        throw ouch(403, 'You must be an admin to view this.');
    }
});