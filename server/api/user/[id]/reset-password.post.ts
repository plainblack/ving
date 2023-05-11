import { useUsers } from '../../../vingrecord/records/User';
import { describeParams } from '../../../utils/rest';
import { useCache } from '../../../cache';
import { ouch } from '../../../../utils/ouch';

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