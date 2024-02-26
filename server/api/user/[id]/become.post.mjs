import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSessionIfRole } from '#ving/utils/rest.mjs';
import { Session } from '#ving/session.mjs';
import { defineEventHandler, getRouterParams, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    let session = obtainSessionIfRole(event, 'admin');
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    session.end();
    session = await Session.start(user, 'become');
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return user.describe(describeParams(event, session));
});