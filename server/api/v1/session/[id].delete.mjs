import { testSession } from '#ving/session.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

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