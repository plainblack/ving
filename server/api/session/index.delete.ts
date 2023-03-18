import { testSession } from '../../session';
import { vingSession, vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    testSession(session);
    session.end();
    return session.describe(vingDescribe(event));
});