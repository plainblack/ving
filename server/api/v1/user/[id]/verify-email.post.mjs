import { useKind } from '#ving/record/utils.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { useCache } from '#ving/cache.mjs';
import { defineEventHandler, getRouterParams, getQuery } from 'h3';
import { log } from '#ving/log.mjs';

export default defineEventHandler(async (event) => {
    log('test').info('a');
    const users = await useKind('User');
    log('test').info('b');
    const { id } = getRouterParams(event);
    log('test').info('c');
    const user = await users.findOrDie(id);
    log('test').info('d');
    await user.canEdit(obtainSession(event));
    log('test').info('e');
    const query = getQuery(event);
    log('test').info('f');
    const result = await useCache().get('verifyEmail-' + query.verify);
    log('test').info('g');
    if (result && result.userId == id) {
        log('test').info('h');
        user.set('verifiedEmail', true);
        log('test').info('i');
        await user.update();
        log('test').info('j');
        const out = await user.describe(describeParams(event));
        log('test').info('k');
        if (!out.meta)
            out.meta = {};
        log('test').info('l');
        out.meta.redirectAfter = result.redirectAfter;
        log('test').info('m');
        await useCache().delete('verifyEmail-' + query.verify);
        log('test').info(out);
        return out;
    }
    return await user.describe(describeParams(event));
});