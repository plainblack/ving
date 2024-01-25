import { sendMail } from '../../email/send';
import { useUsers } from '../../vingrecord/records/User';
import { useCache } from '../../cache';
import { eq } from '../../drizzle/orm';
import { ouch } from '../../../utils/ouch.mjs';
import { obtainSession, describeParams } from '../../utils/rest';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const body = await getBody(event);;
    const user = await Users.findOne(eq(Users.table.email, body.email));
    if (!user)
        throw ouch(404, 'User not found.');
    const config = useRuntimeConfig();
    const resetKey = crypto.randomBytes(6).toString('hex');
    await useCache().set('passwordReset-' + resetKey, { userId: user.get('id') }, 1000 * 60 * 60);
    const query = getQuery(event);
    await sendMail('password-reset', {
        options: { to: user.get('email') }, vars: {
            action_url: config.public.site.url + '/user/' + user.get('id') + '/reset-password?code=' + resetKey,
            operating_system: query.os,
            browser_name: query.browser,
        }
    })
    return await user.describe(describeParams(event));
});