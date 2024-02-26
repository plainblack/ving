import { useKind } from '#ving/record/utils.mjs';
import { describeParams, getBody } from '#ving/utils/rest.mjs';
import { useCache } from '#ving/cache.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { defineEventHandler, getRouterParams } from 'h3';


export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const body = await getBody(event);;
    const result = await useCache().get('passwordReset-' + body.code);
    if (result && result.userId == id && body.password) {
        await user.setPassword(body.password);
        await user.update();
        await useCache().delete('passwordReset-' + body.code);
        return await user.describe(describeParams(event));
    }
    throw ouch(400, 'Password unchanged.');
});