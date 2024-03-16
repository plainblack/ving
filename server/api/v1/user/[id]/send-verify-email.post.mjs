import { sendMail } from '#ving/email/send.mjs';
import { useKind } from '#ving/record/utils.mjs';
import { useCache } from '#ving/cache.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import crypto from 'crypto';
import { defineEventHandler, getRouterParams, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    user.canEdit(obtainSession(event));
    if (!user.get('verifiedEmail')) {
        const query = getQuery(event);
        const config = useRuntimeConfig();
        const verifyKey = crypto.randomBytes(6).toString('hex');
        await useCache().set('verifyEmail-' + verifyKey, { userId: id, redirectAfter: query.redirectAfter }, 1000 * 60 * 60 * 24);
        await sendMail('verify-email', {
            options: { to: user.get('email') }, vars: {
                action_url: config.public.site.url + '/user/verify-email?verify=' + verifyKey,
                operating_system: query.os,
                browser_name: query.browser,
            }
        })
    }
    return await user.describe(describeParams(event));
});