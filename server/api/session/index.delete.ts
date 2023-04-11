import { testSession } from '../../session';
import { obtainSession, describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const session = obtainSession(event);
    testSession(session);
    session.end();
    return session.describe(describeParams(event));
});