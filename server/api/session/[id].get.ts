import { testSession } from '../../session';
import { vingSession, vingDescribe } from '../../helpers';
import { ouch } from '../../../utils/ouch';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    testSession(session);
    const { id } = getRouterParams(event);
    if (session.id == id || session.get('admin')) {
        return session.describe(vingDescribe(event));
    }
    throw ouch(403, 'Session ID in cookie must match the one in the endpoint.')
});