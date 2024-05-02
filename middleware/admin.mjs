import { ouch } from '#ving/utils/ouch.mjs';
export default defineNuxtRouteMiddleware(async (to, from) => {
    const currentUser = useCurrentUser();
    if (!currentUser.props?.admin) {
        throw ouch(403, 'You must be an admin to view this.');
    }
});