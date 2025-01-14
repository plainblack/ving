import { sendMail } from '#ving/email/send.mjs';
import { useKind } from '#ving/record/utils.mjs';
import { useCache } from '#ving/cache.mjs';
import { eq } from '#ving/drizzle/orm.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { describeParams, getBody } from '#ving/utils/rest.mjs';
import crypto from 'crypto';
import { defineEventHandler, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const body = await getBody(event);
    const user = await users.findOne(eq(users.table.email, body.email));
    if (!user)
        throw ouch(404, 'User not found.');
    const config = useRuntimeConfig();
    const resetKey = crypto.randomBytes(6).toString('hex');
    await useCache().set('passwordReset-' + resetKey, { userId: user.get('id') }, 1000 * 60 * 60);
    const query = getQuery(event);
    await sendMail('password-reset', {
        options: { to: user.get('email') }, vars: {
            action_url: config.public.site.url + '/users/' + user.get('id') + '/reset-password?code=' + resetKey,
            operating_system: query.os,
            browser_name: query.browser,
        }
    })
    return await user.describe(describeParams(event));
});