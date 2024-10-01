import { describeParams, obtainSession } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const session = obtainSession(event);
    if (session) {
        const user = await session.user();
        return await user.describe(describeParams(event, session));
    }
    else {
        return {};
    }
})
