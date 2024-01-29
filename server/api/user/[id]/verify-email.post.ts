import { useUsers } from '../../../vingrecord/records/User.mjs';
import { obtainSession, describeParams } from '../../../utils/rest.mjs';
import { useCache } from '../../../cache.mjs';
import { defineEventHandler } from 'h3';


export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
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