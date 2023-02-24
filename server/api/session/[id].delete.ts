import { testSession } from '~/utils/session';
import { ouch, vingSession, vingDescribe } from '~/utils/utils';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    testSession(session);
    const { id } = getRouterParams(event);
    if (session.id == id || session.get('admin')) {
        session.end();
        return session.describe(vingDescribe(event));
    }
    throw ouch(403, 'Session ID in cookie must match the one in the endpoint.')
});