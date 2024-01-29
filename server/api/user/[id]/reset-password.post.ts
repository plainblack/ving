import { useUsers } from '../../../vingrecord/records/User.mjs';
import { describeParams } from '../../../utils/rest.mjs';
import { useCache } from '../../../cache.mjs';
import { ouch } from './../../../utils/ouch.mjs';
import { defineEventHandler } from 'h3';


export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
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