import { useKind } from '#ving/record/utils.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const session = obtainSession(event);
    user.canEdit(session);
    if (!session.isHuman())
        throw ouch(403, 'You must be a human to modify user account settings.');
    await user.updateAndVerify(await getBody(event), session);
    return user.describe(describeParams(event, session));
});