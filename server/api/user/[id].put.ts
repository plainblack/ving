import { User } from '../../../typeorm/entity/User';
import { vingDescribe, vingSession, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await User.findIdOrDie(id);
    user.canEdit(vingSession(event));
    await user.updateAndVerify(await vingBody(event), vingSession(event));
    return user.describe(vingDescribe(event));
});