import { testSession } from '#ving/session.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const session = obtainSession(event);
    testSession(session);
    session.end();
    return session.describe(describeParams(event));
});