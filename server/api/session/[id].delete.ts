import { testSession } from '../../session';
import { obtainSession, describeParams } from '../../utils/rest';
import { ouch } from '../../../utils/ouch';
export default defineEventHandler(async (event) => {
    const session = obtainSession(event);
    testSession(session);
    const { id } = getRouterParams(event);
    if (session.id == id || session.get('admin')) {
        session.end();
        return session.describe(describeParams(event));
    }
    throw ouch(403, 'Session ID in cookie must match the one in the endpoint.')
});