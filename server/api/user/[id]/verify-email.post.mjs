import { useKind } from '#ving/record/utils.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { useCache } from '#ving/cache.mjs';
import { defineEventHandler, getRouterParams, getQuery } from 'h3';


export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    user.canEdit(obtainSession(event));
    const query = getQuery(event);
    const result = await useCache().get('verifyEmail-' + query.verify);
    if (result && result.userId == id) {
        user.set('verifiedEmail', true);
        await user.update();
        const out = await user.describe(describeParams(event));
        if (!out.meta)
            out.meta = {};
        out.meta.redirectAfter = result.redirectAfter;
        await useCache().delete('verifyEmail-' + query.verify);
        return out;
    }
    return await user.describe(describeParams(event));
});